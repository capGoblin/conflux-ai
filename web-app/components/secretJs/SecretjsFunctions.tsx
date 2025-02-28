import { useContext, useState } from "react";
import { SecretjsContext } from "./SecretjsContext";

const contractCodeHash =
  "74807322a4b78b95204825da46dee59294ee1bcf1797c29d6e9fed687840d3d0";
const contractAddress = "secret1hxhp7vu3eywv20sr8upl427jdcjlf7fgaq3wpd";

const SecretjsFunctions = () => {
  const { secretjs, secretAddress } = useContext(SecretjsContext);

  let handle_deposit = async (amount: any) => {
    const tx = await secretjs.tx.compute.executeContract(
      {
        sender: secretAddress,
        contract_address: contractAddress,
        msg: {
          deposit: {
            amount: amount,
          },
        },
        code_hash: contractCodeHash,
      },
      { gasLimit: 100_000 }
    );

    console.log(tx);
  };

  let handle_record_contribution = async () => {
    const tx = await secretjs.tx.compute.executeContract(
      {
        sender: secretAddress,
        contract_address: contractAddress,
        msg: {
          record_contribution: {
            sender: secretAddress,
            score: 2,
          },
        },
        code_hash: contractCodeHash,
      },
      { gasLimit: 100_000 }
    );

    console.log(tx);
  };

  let handle_distribute_profit = async () => {
    const tx = await secretjs.tx.compute.executeContract(
      {
        sender: secretAddress,
        contract_address: contractAddress,
        msg: {
          distribute_profit: {},
        },
        code_hash: contractCodeHash,
      },
      { gasLimit: 100_000 }
    );

    console.log(tx);
  };

  let handle_record_total_profit = async (totalProfit: any) => {
    const tx = await secretjs.tx.compute.executeContract(
      {
        sender: secretAddress,
        contract_address: contractAddress,
        msg: {
          record_total_profit: {
            total_profit: totalProfit,
          },
        },
        code_hash: contractCodeHash,
      },
      { gasLimit: 100_000 }
    );

    console.log(tx);
  };

  return {
    handle_deposit,
    handle_record_contribution,
    handle_distribute_profit,
    handle_record_total_profit,
  };
};

export { SecretjsFunctions };
