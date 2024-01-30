export const USER_ROLE = {
    neo: 1,
    manager: 10,
    orders: 11,
    toolManager: 12,
    hidraulicMechanical: 20,
    mechanic: 21,
    telctrician: 28,
    electrician: 22,
    welder: 26,
    quant_cl07: 24,
    cap: 23,
    cap_electrician: 25,
    ito_cap: 27,
    upp: 29,
    coladaOverseer: 30,
}

export const PURCHASE_ORDER_STATUS = {
    created: 0,
    aproved: 1,
    received: 2,
    reject: 99,    
}

export const STORAGE_ITEM_STATE = {
    operative: 1,
    reparation: 2,
    discard: 3,
}

export const OPERATIONS = {
    in: 1,
    out: 2,
    repair_in: 17,
    repair_out: 18,
    down: 25,
}
