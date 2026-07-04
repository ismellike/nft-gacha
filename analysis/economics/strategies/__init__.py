"""Pluggable strategy package for the SPINFI economic simulation.

Importing this package auto-imports every sibling module so each module's
``@register(...)`` decorators fire — dropping a new variation module into
``strategies/`` is fully self-wiring, with no shared-file edits. Import order is
deterministic (sorted by ``pkgutil``); ``base`` and ``registry`` have no
side effects, and ``defaults`` + variation modules only register.

Public entry points re-exported for convenience:
    from strategies import build_bundle, register, available
    from strategies.base import SimState, StrategyBundle, ...  (protocols/domain)
"""

from __future__ import annotations

import importlib
import pkgutil

# Import every submodule so all @register decorators run at package import.
for _m in pkgutil.iter_modules(__path__):
    importlib.import_module(f"{__name__}.{_m.name}")

from strategies.registry import (  # noqa: E402  (must follow auto-import)
    available,
    build,
    build_bundle,
    parse_spec,
    register,
)

__all__ = ["available", "build", "build_bundle", "parse_spec", "register"]
