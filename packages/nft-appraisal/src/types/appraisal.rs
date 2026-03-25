use crate::resolvers::scrydex_resolver::ScrydexCardInfo;
use serde::{Deserialize, Serialize};

/// Provider types supported by the system
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ProviderType {
    Courtyard,
    Pfp,
    Generic,
}

/// Resolver families supported by the appraisal engine.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ResolverKind {
    PokemonGradedCard,
}

/// Resolver-specific arguments produced by providers.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ResolverArgs {
    ScrydexCardInfo(ScrydexCardInfo),
}

impl ResolverArgs {
    pub fn cache_fragment(&self) -> String {
        match self {
            ResolverArgs::ScrydexCardInfo(info) => {
                let variant_fragment = info
                    .variant
                    .as_ref()
                    .map(|v| v.trim().to_ascii_lowercase())
                    .filter(|v| !v.is_empty())
                    .unwrap_or_else(|| "novariant".to_string());
                format!(
                    "{}-{}-{}-{}-{}-{}",
                    info.card_number.trim().to_ascii_lowercase(),
                    info.grade.trim().to_ascii_lowercase(),
                    info.company.trim().to_ascii_lowercase(),
                    info.is_perfect,
                    info.set_id.trim().to_ascii_lowercase(),
                    variant_fragment
                )
            }
        }
    }
}

/// Complete routing information from provider to resolver.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ResolverRoute {
    pub kind: ResolverKind,
    pub args: ResolverArgs,
}

impl ResolverRoute {
    pub fn pokemon_card_info(
        card_number: String,
        grade: String,
        company: String,
        is_perfect: bool,
        set_id: String,
        variant: Option<String>,
    ) -> Self {
        Self {
            kind: ResolverKind::PokemonGradedCard,
            args: ResolverArgs::ScrydexCardInfo(ScrydexCardInfo {
                card_number,
                grade,
                company,
                is_perfect,
                set_id,
                variant,
            }),
        }
    }

    pub fn cache_key_fragment(&self) -> String {
        self.args.cache_fragment()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::resolvers::scrydex_resolver::ScrydexCardInfo;

    fn card_info(
        card_number: &str,
        grade: &str,
        company: &str,
        is_perfect: bool,
        set_id: &str,
        variant: Option<&str>,
    ) -> ResolverArgs {
        ResolverArgs::ScrydexCardInfo(ScrydexCardInfo {
            card_number: card_number.to_string(),
            grade: grade.to_string(),
            company: company.to_string(),
            is_perfect,
            set_id: set_id.to_string(),
            variant: variant.map(str::to_string),
        })
    }

    // -----------------------------------------------------------------------
    // cache_fragment — None variant
    // -----------------------------------------------------------------------

    #[test]
    fn cache_fragment_none_variant_produces_novariant() {
        let args = card_info("1", "9", "PSA", false, "base1", None);
        let fragment = args.cache_fragment();
        assert!(
            fragment.ends_with("-novariant"),
            "None variant must produce '-novariant' suffix; got: {fragment}"
        );
    }

    #[test]
    fn cache_fragment_empty_string_variant_produces_novariant() {
        let args = card_info("1", "9", "PSA", false, "base1", Some(""));
        let fragment = args.cache_fragment();
        assert!(
            fragment.ends_with("-novariant"),
            "empty string variant must produce '-novariant' suffix; got: {fragment}"
        );
    }

    #[test]
    fn cache_fragment_whitespace_only_variant_produces_novariant() {
        let args = card_info("1", "9", "PSA", false, "base1", Some("  "));
        let fragment = args.cache_fragment();
        assert!(
            fragment.ends_with("-novariant"),
            "whitespace-only variant must produce '-novariant' suffix; got: {fragment}"
        );
    }

    // -----------------------------------------------------------------------
    // cache_fragment — case normalisation
    // -----------------------------------------------------------------------

    #[test]
    fn cache_fragment_grade_is_lowercased() {
        let args = card_info("1", "PSA-10", "PSA", false, "base1", None);
        let fragment = args.cache_fragment();
        assert!(
            fragment.contains("psa-10"),
            "grade must be lowercased in fragment; got: {fragment}"
        );
        assert!(
            !fragment.contains("PSA-10"),
            "uppercase grade must not appear in fragment; got: {fragment}"
        );
    }

    #[test]
    fn cache_fragment_company_is_lowercased() {
        let args = card_info("1", "9", "PSA", false, "base1", None);
        let fragment = args.cache_fragment();
        assert!(
            fragment.contains("psa"),
            "company must be lowercased in fragment; got: {fragment}"
        );
    }

    #[test]
    fn cache_fragment_variant_is_lowercased() {
        let args = card_info("1", "9", "PSA", false, "base1", Some("Holofoil"));
        let fragment = args.cache_fragment();
        assert!(
            fragment.ends_with("-holofoil"),
            "variant must be lowercased in fragment; got: {fragment}"
        );
    }

    #[test]
    fn cache_fragment_set_id_is_lowercased() {
        let args = card_info("1", "9", "PSA", false, "BASE1", None);
        let fragment = args.cache_fragment();
        assert!(
            fragment.contains("base1"),
            "set_id must be lowercased in fragment; got: {fragment}"
        );
    }

    // -----------------------------------------------------------------------
    // cache_fragment — determinism
    // -----------------------------------------------------------------------

    #[test]
    fn cache_fragment_is_deterministic() {
        let args_a = card_info("58/102", "9", "PSA", false, "base1", Some("Normal"));
        let args_b = card_info("58/102", "9", "PSA", false, "base1", Some("Normal"));
        assert_eq!(
            args_a.cache_fragment(),
            args_b.cache_fragment(),
            "same inputs must produce the same fragment"
        );
    }

    #[test]
    fn cache_fragment_differs_for_different_grades() {
        let args_9 = card_info("1", "9", "PSA", false, "base1", None);
        let args_10 = card_info("1", "10", "PSA", false, "base1", None);
        assert_ne!(args_9.cache_fragment(), args_10.cache_fragment());
    }

    #[test]
    fn cache_fragment_differs_for_different_companies() {
        let args_psa = card_info("1", "9", "PSA", false, "base1", None);
        let args_bgs = card_info("1", "9", "BGS", false, "base1", None);
        assert_ne!(args_psa.cache_fragment(), args_bgs.cache_fragment());
    }

    #[test]
    fn cache_fragment_differs_for_perfect_vs_non_perfect() {
        let args_not_perfect = card_info("1", "10", "PSA", false, "base1", None);
        let args_perfect = card_info("1", "10", "PSA", true, "base1", None);
        assert_ne!(args_not_perfect.cache_fragment(), args_perfect.cache_fragment());
    }
}
