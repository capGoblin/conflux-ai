import { useContext, useState } from "react";
import { SecretjsContext } from "./SecretjsContext";

const contractCodeHash =
  "9c31e69958e91eb285b2009220d6c3808c70f68a3b994e7cba07300772233b4d";
const contractAddress = "secret1c9qtyavp5yw3rmad9wyeuhj8mtnv2h7qycqru5";

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

  let handle_set_global_model_cid = async (cid: any) => {
    const tx = await secretjs.tx.compute.executeContract(
      {
        sender: secretAddress,
        contract_address: contractAddress,
        msg: {
          set_global_model_c_i_d: {
            cid: cid,
          },
        },
        code_hash: contractCodeHash,
      },
      { gasLimit: 100_000 }
    );

    console.log(tx);
  };

  let handle_query_global_model_cid = async () => {
    let tx = await secretjs.query.compute.queryContract({
      contract_address: contractAddress,
      code_hash: contractCodeHash,
      query: {
        get_global_model_c_i_d: {},
      },
    });
    console.log(tx);
  };

  return {
    handle_deposit,
    handle_record_contribution,
    handle_distribute_profit,
    handle_record_total_profit,
    handle_set_global_model_cid,
    handle_query_global_model_cid,
  };
};

export { SecretjsFunctions };
