use cosmwasm_std::{
    entry_point, to_binary, Addr, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdError,
    StdResult,
};

use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};
use crate::state::{config, config_read, State, SCORES};

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, StdError> {
    let state = State {
        total_deposit: msg.total_deposit,
        owner: info.sender.clone(),
        total_profit: 0,
        global_model_cid: String::new(),
    };

    config(deps.storage).save(&state)?;

    deps.api
        .debug(&format!("Contract was initialized by {}", info.sender));

    Ok(Response::default())
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    _info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Deposit { amount } => handle_deposit(deps, env, amount),
        ExecuteMsg::RecordContribution { sender, score } => {
            handle_record_contribution(deps, env, sender, score)
        }
        ExecuteMsg::DistributeProfit {} => handle_distribute_profit(deps, env),
        ExecuteMsg::RecordTotalProfit { total_profit } => {
            handle_record_total_profit(deps, env, total_profit)
        }
        ExecuteMsg::SetGlobalModelCID { cid } => handle_set_global_model_cid(deps, env, cid),
    }
}

pub fn handle_deposit(deps: DepsMut, _env: Env, amount: u32) -> Result<Response, ContractError> {
    config(deps.storage).update(|mut state| -> Result<_, ContractError> {
        state.total_deposit += amount;
        Ok(state)
    })?;

    deps.api.debug(&format!("You deposited: {}", amount));
    Ok(Response::new()
        .add_attribute("action", "deposit")
        .add_attribute("amount", amount.to_string()))
}

pub fn handle_record_contribution(
    deps: DepsMut,
    _env: Env,
    sender: Addr,
    score: u32,
) -> Result<Response, ContractError> {
    if score > 10 {
        return Err(ContractError::CustomError {
            val: "Score must be between 0 and 10".to_string(),
        });
    }

    SCORES.insert(deps.storage, &sender.to_string(), &score)?;

    deps.api
        .debug(&format!("Score recorded for {}: {}", sender, score));
    Ok(Response::new()
        .add_attribute("action", "record_contribution")
        .add_attribute("sender", sender.to_string())
        .add_attribute("score", score.to_string()))
}

pub fn handle_distribute_profit(deps: DepsMut, _env: Env) -> Result<Response, ContractError> {
    let state = config(deps.storage).load()?;
    let total_profit = state.total_profit;

    let mut total_score: u32 = 0;
    let mut distribution: Vec<u32> = Vec::new();

    // Extract KeyIter from Result, handle error if necessary
    let key_iter_result = SCORES.iter_keys(deps.storage);

    // Calculate total scores
    for key in key_iter_result? {
        let key = key?; // Unwrap the key
        let score = SCORES.get(deps.storage, &key).unwrap_or(0); // Get the score for the sender
        total_score += score;
    }

    // Calculate each user's share
    let key_iter_result = SCORES.iter_keys(deps.storage);
    for key in key_iter_result? {
        let key = key?; // Unwrap the key
        let score = SCORES.get(deps.storage, &key).unwrap_or(0); // Get the score for the sender
        let share = if total_score > 0 {
            (score * total_profit) / total_score // Calculate profit share
        } else {
            0 // No scores, no distribution
        };
        distribution.push(share); // Push the share directly into the Vec<u32>
    }

    // Log the distribution for debugging
    for (i, share) in distribution.iter().enumerate() {
        deps.api
            .debug(&format!("User {} will receive: {}", i, share));
    }

    // Return the distribution as a response
    Ok(Response::new()
        .add_attribute("action", "distribute_profit")
        .add_attribute("distribution", format!("{:?}", distribution)))
}

pub fn handle_record_total_profit(
    deps: DepsMut,
    _env: Env,
    total_profit: u32,
) -> Result<Response, ContractError> {
    config(deps.storage).update(|mut state| -> Result<_, ContractError> {
        state.total_profit = total_profit; // Update the total profit
        Ok(state)
    })?;

    deps.api
        .debug(&format!("Total profit recorded: {}", total_profit));
    Ok(Response::new()
        .add_attribute("action", "record_total_profit")
        .add_attribute("total_profit", total_profit.to_string()))
}

pub fn handle_set_global_model_cid(
    deps: DepsMut,
    _env: Env,
    cid: String,
) -> Result<Response, ContractError> {
    let cid_ref = cid.clone(); // Clone the String to get a reference
    config(deps.storage).update(|mut state| -> Result<_, ContractError> {
        state.global_model_cid = cid_ref.clone(); // Set the global_model_cid
        Ok(state)
    })?;

    Ok(Response::new()
        .add_attribute("action", "set_global_model_cid")
        .add_attribute("global_model_cid", &cid_ref)) // Use reference here
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetTotalDeposit {} => to_binary(&query_total_deposit(deps)?),
        QueryMsg::GetGlobalModelCID {} => to_binary(&query_global_model_cid(deps)?),
    }
}

fn query_total_deposit(deps: Deps) -> StdResult<u32> {
    let state = config_read(deps.storage).load()?;
    Ok(state.total_deposit)
}

pub fn query_global_model_cid(deps: Deps) -> StdResult<String> {
    let state = config_read(deps.storage).load()?;
    Ok(state.global_model_cid)
}
