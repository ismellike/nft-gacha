# Scrydex API Full Reference

## Graded Price Response Example

```json
{
  "data": {
    "id": "base1-4",
    "name": "Charizard",
    "number": "4",
    "rarity": "Rare Holo",
    "expansion": { "id": "base1", "name": "Base", "code": "BS" },
    "variants": [
      {
        "name": "unlimitedHolofoil",
        "prices": [
          {
            "grade": "10",
            "company": "PSA",
            "is_perfect": false,
            "is_signed": false,
            "is_error": false,
            "type": "graded",
            "low": 2350.0,
            "mid": 2566.0,
            "high": 2650.0,
            "market": 2567.88,
            "currency": "USD",
            "trends": {
              "days_1": { "price_change": 111.75, "percent_change": 4.55 },
              "days_7": { "price_change": 111.75, "percent_change": 4.55 },
              "days_14": { "price_change": -11.3, "percent_change": -0.44 },
              "days_30": { "price_change": -10.93, "percent_change": -0.42 },
              "days_90": { "price_change": -153.12, "percent_change": -5.63 },
              "days_180": { "price_change": -1658.19, "percent_change": -39.24 }
            }
          }
        ]
      }
    ]
  }
}
```

## Courtyard NFT Metadata Structure

```json
{
  "name": "PSA 10 GEM MINT 1999 Pokemon Base Set Shadowless...",
  "attributes": [
    { "trait_type": "Card Number", "value": "058/102" },
    { "trait_type": "Grader", "value": "PSA" },
    { "trait_type": "Grade", "value": "GEM MINT 10" },
    { "trait_type": "Set", "value": "Pokemon Base" },
    { "trait_type": "Year", "value": "1999" },
    { "trait_type": "Category", "value": "Pokemon TCG" },
    { "trait_type": "Language", "value": "English" },
    { "trait_type": "Title/Subject", "value": "Pikachu" },
    { "value": "1st Edition" },
    { "value": "Shadowless" },
    { "value": "Holo" }
  ]
}
```

## Variant String Mapping

| Courtyard Value | Scrydex Format |
|-----------------|----------------|
| `1st Edition` | `firstEdition` |
| `Shadowless` | `Shadowless` |
| `Unlimited` | `unlimited` |
| `Holo` / `Holofoil` | `Holofoil` |
| `Reverse Holo` | `ReverseHolofoil` |
| `Cosmos Holo` | `CosmosHolo` |
| `Snowflake Stamp` | `holidayStamp` |
| `Normal` | `Normal` |
| `Full Art` | `FullArt` |
| `Special Illustration Rare` | `SpecialIllustrationRare` |

Combined example: `["1st Edition", "Shadowless", "Holo"]` -> `"firstEditionShadowlessHolofoil"`

## Workflow: Metadata to Price

```
1. Fetch Courtyard metadata
   curl -s "https://api.courtyard.io/index/token/polygon/{contract}/{tokenId}/metadata.json"

2. Extract card info from attributes
   card_number, grade, company, is_perfect, set_id, variant

3. Construct card identifier
   {set_id}-{normalized_card_number}

4. Query Scrydex
   GET /pokemon/v1/cards/{card_id}?include=prices

5. Match price
   Find variant -> find grade+company+is_perfect -> read market field
```
