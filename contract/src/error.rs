use cosmwasm_std::StdError;

#[derive(Debug, thiserror::Error)]
pub enum ContractError {
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    #[error("Standard error: {0}")]
    StdError(StdError),
    // Other error variants...
}
