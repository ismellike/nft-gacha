use std::collections::HashMap;
use std::sync::Arc;

use anyhow::{anyhow, Result};

use crate::core::cache::{AppraisalCache, CacheResult};
use crate::resolvers::scrydex::ScrydexPokemonResolver;
use crate::traits::pricing::{PriceResolver, ResolverQuote};
use crate::types::{ResolverKind, ResolverRoute};

/// Registry of resolvers so providers can route to multiple pricing backends.
#[derive(Clone)]
pub struct ResolverRegistry {
    resolvers: HashMap<ResolverKind, Arc<dyn PriceResolver>>,
}

impl ResolverRegistry {
    pub fn new(resolvers: Vec<RegisteredResolver>) -> Self {
        let mut map = HashMap::new();
        for resolver in resolvers {
            let (kind, arc) = resolver.into_kind_and_arc();
            map.insert(kind, arc);
        }
        Self { resolvers: map }
    }

    pub async fn resolve(&self, route: &ResolverRoute) -> Result<Option<ResolverQuote>> {
        let resolver = self
            .resolvers
            .get(&route.kind)
            .ok_or_else(|| anyhow!("No resolver registered for kind {:?}", route.kind))?;

        let quote = resolver.get_price(&route.args).await?;
        Ok(quote.map(|q| resolver.normalize_quote(q)))
    }

    pub async fn resolve_with_cache(
        &self,
        route: &ResolverRoute,
        cache: &AppraisalCache,
        price_epoch: u64,
    ) -> Result<Option<ResolverQuote>> {
        let cache_key = cache.generate_cache_key(&Self::cache_seed(route));
        match cache.get(&cache_key, price_epoch)? {
            CacheResult::Hit(quote) => return Ok(Some(quote)),
            CacheResult::NegativeHit => return Ok(None),
            CacheResult::Miss => {}
        }

        let fresh = self.resolve(route).await?;
        let _ = cache.set(&cache_key, fresh.as_ref(), price_epoch);
        Ok(fresh)
    }

    pub fn cache_seed(route: &ResolverRoute) -> String {
        format!("{:?}::{}", route.kind, route.cache_key_fragment())
    }
}

pub enum RegisteredResolver {
    Scrydex(ScrydexPokemonResolver),
}

impl RegisteredResolver {
    fn into_kind_and_arc(self) -> (ResolverKind, Arc<dyn PriceResolver>) {
        match self {
            RegisteredResolver::Scrydex(resolver) => {
                (ResolverKind::PokemonGradedCard, Arc::new(resolver))
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::ResolverRoute;

    // -----------------------------------------------------------------------
    // cache_seed format
    // -----------------------------------------------------------------------

    #[test]
    fn cache_seed_contains_kind_and_fragment() {
        let route = ResolverRoute::pokemon_card_info(
            "58/102".to_string(),
            "9".to_string(),
            "PSA".to_string(),
            false,
            "base1".to_string(),
            None,
        );
        let seed = ResolverRegistry::cache_seed(&route);

        // Must mention the resolver kind.
        assert!(
            seed.contains("PokemonGradedCard"),
            "cache seed must contain the resolver kind; got: {seed}"
        );
        // Must contain the cache key fragment from the route.
        let fragment = route.cache_key_fragment();
        assert!(
            seed.ends_with(&fragment),
            "cache seed must end with the route fragment; got: {seed}, fragment: {fragment}"
        );
    }

    #[test]
    fn cache_seed_is_deterministic() {
        let route = ResolverRoute::pokemon_card_info(
            "1".to_string(),
            "10".to_string(),
            "PSA".to_string(),
            true,
            "sv5a".to_string(),
            Some("Normal".to_string()),
        );
        let seed_a = ResolverRegistry::cache_seed(&route);
        let seed_b = ResolverRegistry::cache_seed(&route);
        assert_eq!(
            seed_a, seed_b,
            "cache_seed must be deterministic for the same route"
        );
    }

    #[test]
    fn cache_seed_differs_for_different_routes() {
        let route_a = ResolverRoute::pokemon_card_info(
            "1".to_string(),
            "9".to_string(),
            "PSA".to_string(),
            false,
            "base1".to_string(),
            None,
        );
        let route_b = ResolverRoute::pokemon_card_info(
            "1".to_string(),
            "10".to_string(),
            "PSA".to_string(),
            false,
            "base1".to_string(),
            None,
        );
        assert_ne!(
            ResolverRegistry::cache_seed(&route_a),
            ResolverRegistry::cache_seed(&route_b),
            "different routes must produce different cache seeds"
        );
    }

    // -----------------------------------------------------------------------
    // resolve — no resolver registered for a kind (sync assertion)
    //
    // `resolve` is async but it fails synchronously when the HashMap lookup
    // misses (before any .await yields).  We verify this by driving the future
    // with a minimal single-poll executor implemented with `std::future`.
    // -----------------------------------------------------------------------

    #[test]
    fn resolve_errors_when_no_resolver_registered() {
        use std::future::Future;
        use std::task::{Context, Poll, RawWaker, RawWakerVTable, Waker};

        // Minimal waker that does nothing — sufficient for futures that are
        // Ready on the very first poll (no .await that yields).
        fn noop_clone(data: *const ()) -> RawWaker {
            RawWaker::new(data, &NOOP_VTABLE)
        }
        fn noop(_data: *const ()) {}
        static NOOP_VTABLE: RawWakerVTable = RawWakerVTable::new(noop_clone, noop, noop, noop);
        fn noop_waker() -> Waker {
            let raw = RawWaker::new(std::ptr::null(), &NOOP_VTABLE);
            // SAFETY: The noop waker vtable satisfies all the contract requirements.
            unsafe { Waker::from_raw(raw) }
        }

        let registry = ResolverRegistry::new(vec![]);
        let route = ResolverRoute::pokemon_card_info(
            "1".to_string(),
            "9".to_string(),
            "PSA".to_string(),
            false,
            "base1".to_string(),
            None,
        );

        let waker = noop_waker();
        let mut cx = Context::from_waker(&waker);
        let mut fut = Box::pin(registry.resolve(&route));
        let poll_result = fut.as_mut().poll(&mut cx);

        match poll_result {
            Poll::Ready(result) => {
                assert!(
                    result.is_err(),
                    "resolving with no registered resolver must return an error"
                );
                let msg = result.unwrap_err().to_string();
                assert!(
                    msg.contains("No resolver registered"),
                    "error message must mention missing resolver; got: {msg}"
                );
            }
            Poll::Pending => {
                panic!(
                    "resolve on empty registry must complete synchronously (Ready), not Pending"
                );
            }
        }
    }
}
