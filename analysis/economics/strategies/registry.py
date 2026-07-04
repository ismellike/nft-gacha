"""Two-level decorator registry mapping ``seam -> name -> factory``.

A strategy class self-registers by placing ``@register("draw", "weighted")``
above its class definition; the factory is the class itself and ``build`` calls
``factory(**spec.params)``. ``strategies/__init__.py`` pkgutil-auto-imports every
sibling module, so dropping a new variation module into ``strategies/`` fires its
decorators with no shared-file edits.

``build_bundle(scenario)`` resolves ``scenario.variations`` (a VariationConfig)
into a :class:`StrategyBundle` of seven concrete instances, bridging the
``yield_ is None`` sentinel to the ``scenario.yield_mode`` router.
"""

from __future__ import annotations

from typing import Any, Callable

from scenarios import Scenario, StratSpec, VariationConfig

from strategies.base import StrategyBundle

# seam name -> strategy name -> factory (callable(**params) -> instance)
_REGISTRY: dict[str, dict[str, Callable[..., Any]]] = {}

# The seven seams, in canonical order.
SEAMS = ("topology", "draw", "pricing", "demand", "supply", "redemption", "yield")


def register(seam: str, name: str) -> Callable[[type], type]:
    """Class decorator: register ``cls`` as ``seam``/``name``. Returns ``cls``."""
    if seam not in SEAMS:
        raise KeyError(f"unknown seam '{seam}'. Seams: {', '.join(SEAMS)}")

    def deco(cls: type) -> type:
        _REGISTRY.setdefault(seam, {})[name] = cls
        return cls

    return deco


def available(seam: str) -> list[str]:
    """Registered strategy names for ``seam`` (sorted)."""
    return sorted(_REGISTRY.get(seam, {}))


def build(seam: str, spec: StratSpec) -> Any:
    """Instantiate one strategy from a StratSpec (``factory(**spec.params)``)."""
    table = _REGISTRY.get(seam, {})
    if spec.name not in table:
        raise KeyError(
            f"unknown {seam} strategy '{spec.name}'. Available: {', '.join(available(seam)) or '(none)'}"
        )
    return table[spec.name](**spec.params)


def parse_spec(text: str) -> StratSpec:
    """Parse ``'name:k=v,k2=v2'`` into a StratSpec (values coerced int/float/str)."""
    if ":" in text:
        name, rest = text.split(":", 1)
    else:
        name, rest = text, ""
    params: dict[str, Any] = {}
    if rest:
        for pair in rest.split(","):
            if not pair:
                continue
            if "=" not in pair:
                raise ValueError(f"bad param '{pair}' (expected k=v) in spec '{text}'")
            k, v = pair.split("=", 1)
            params[k.strip()] = _coerce(v.strip())
    return StratSpec(name=name.strip(), params=params)


def _coerce(v: str) -> Any:
    for cast in (int, float):
        try:
            return cast(v)
        except ValueError:
            pass
    return v


def _yield_spec(scenario: Scenario, variations: VariationConfig) -> StratSpec:
    """Resolve the yield seam: explicit spec wins, else bridge from yield_mode."""
    if variations.yield_ is not None:
        return variations.yield_
    name = "per_rarity" if scenario.yield_mode == "per_rarity" else "global_value"
    return StratSpec(name)


def build_bundle(scenario: Scenario) -> StrategyBundle:
    """Resolve ``scenario.variations`` into seven concrete seam instances."""
    v = scenario.variations
    return StrategyBundle(
        topology=build("topology", v.topology),
        draw=build("draw", v.draw),
        pricing=build("pricing", v.pricing),
        demand=build("demand", v.demand),
        supply=build("supply", v.supply),
        redemption=build("redemption", v.redemption),
        yield_=build("yield", _yield_spec(scenario, v)),
    )
