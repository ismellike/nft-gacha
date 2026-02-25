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
    ) -> Result<Option<ResolverQuote>> {
        let cache_key = cache.generate_cache_key(&Self::cache_seed(route));
        match cache.get(&cache_key)? {
            CacheResult::Hit(quote) => return Ok(Some(quote)),
            CacheResult::NegativeHit => return Ok(None),
            CacheResult::Miss => {}
        }

        let fresh = self.resolve(route).await?;
        let _ = cache.set(&cache_key, fresh.as_ref());
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
