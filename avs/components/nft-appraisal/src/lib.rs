#[rustfmt::skip]
#[allow(clippy::all)]
mod bindings;

use crate::bindings::{export, Guest, TriggerAction, WasmResponse};

struct Component;

impl Guest for Component {
    fn run(_action: TriggerAction) -> std::result::Result<Option<WasmResponse>, String> {
        Ok(None)
    }
}

export!(Component with_types_in bindings);
