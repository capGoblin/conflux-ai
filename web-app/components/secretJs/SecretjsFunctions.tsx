"use client";
import { useContext, useState } from "react";
import { SecretjsContext } from "./SecretjsContext";
import { SecretNetworkClient } from "secretjs";

const contractCodeHash =
  "11f591e2f9cebdc743915c1e92be82a9b256d527a31a914fc807063fa111c0c5";
const contractAddress = "secret15hfa4y3skxyc0kpy9hy0m3gwlvhcv7ftet9ctq";

const SecretjsFunctions = () => {
  const { secretAddress } = useContext(SecretjsContext) || {
    secretjs: null,
    secretAddress: "",
  };

  const secretjs = new SecretNetworkClient({
    chainId: "pulsar-3",
    url: "https://pulsar.lcd.secretnodes.com",
    wallet: window.getOfflineSignerOnlyAmino("pulsar-3"),
    walletAddress: secretAddress,
  });
  let handle_deposit = async (amount: any) => {
    if (!secretjs) return;
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

  let handle_record_contribution = async (score: any) => {
    if (!secretjs) return;
    const tx = await secretjs.tx.compute.executeContract(
      {
        sender: secretAddress,
        contract_address: contractAddress,
        msg: {
          record_contribution: {
            sender: secretAddress,
            score: score,
          },
        },
        code_hash: contractCodeHash,
      },
      { gasLimit: 100_000 }
    );

    console.log(tx);
  };

  // let handle_distribute_profit = async () => {
  //   if (!secretjs) return;
  //   const tx = await secretjs.tx.compute.executeContract(
  //     {
  //       sender: secretAddress,
  //       contract_address: contractAddress,
  //       msg: {
  //         distribute_profit: {},
  //       },
  //       code_hash: contractCodeHash,
  //     },
  //     { gasLimit: 100_000 }
  //   );

  //   console.log(tx);
  //   console.log('Transaction Logs:', tx.arrayLog);

  //   // Check if tx and tx.arrayLog are defined
  //   if (!tx || !tx.arrayLog) return 0;

  //   // Extract the distribution amount
  //   const distributionLog = tx.arrayLog.find(log => log.key === 'distribution');
  //   const amount = distributionLog ? JSON.parse(distributionLog.value)[0] : 0;

  //   return amount; // Return the extracted amount
  // };

  let handle_record_total_profit = async (totalProfit: any) => {
    if (!secretjs) return;
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
    if (!secretjs) return;
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
    if (!secretjs) return;
    let tx = await secretjs.query.compute.queryContract({
      contract_address: contractAddress,
      code_hash: contractCodeHash,
      query: {
        get_global_model_c_i_d: {},
      },
    });
    console.log(tx);
  };

  let handle_query_contribution_score = async () => {
    if (!secretjs) return;
    let tx = await secretjs.query.compute.queryContract({
      contract_address: contractAddress,
      code_hash: contractCodeHash,
      query: {
        get_contribution_score: {
          sender: secretAddress,
        },
      },
    });
    return tx;
  };

  let handle_query_profit_distribution = async (): Promise<number> => {
    if (!secretjs) return 0;
    let tx: number[] = await secretjs.query.compute.queryContract({
      contract_address: contractAddress,
      code_hash: contractCodeHash,
      query: {
        get_profit_distribution: {},
      },
    });
    console.log(tx);

    return tx[0]; // Cast the response to number[]
  };

  return {
    handle_deposit,
    handle_record_contribution,
    // handle_distribute_profit,
    handle_record_total_profit,
    handle_set_global_model_cid,
    handle_query_global_model_cid,
    handle_query_contribution_score,
    handle_query_profit_distribution,
  };
};

export { SecretjsFunctions };
