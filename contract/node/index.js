import { SecretNetworkClient, Wallet } from "secretjs";
import * as fs from "fs";
// import dotenv from "dotenv";
// dotenv.config();

const wallet = new Wallet("radar injury pond there dad trick language ritual domain supreme tell ring");

const contract_wasm = fs.readFileSync("../conflux-ai.wasm.gz");
const codeId = 13546;
const contractCodeHash =
  "11f591e2f9cebdc743915c1e92be82a9b256d527a31a914fc807063fa111c0c5";
const contractAddress = "secret15hfa4y3skxyc0kpy9hy0m3gwlvhcv7ftet9ctq";

const secretjs = new SecretNetworkClient({
  chainId: "pulsar-3",
  url: "https://pulsar.lcd.secretnodes.com",
  wallet: wallet,
  walletAddress: wallet.address,
});

let upload_contract = async () => {
  let tx = await secretjs.tx.compute.storeCode(
    {
      sender: wallet.address,
      wasm_byte_code: contract_wasm,
      source: "",
      builder: "",
    },
    {
      gasLimit: 4_000_000,
    }
  );

  const codeId = Number(
    tx.arrayLog.find((log) => log.type === "message" && log.key === "code_id")
      .value
  );

  console.log("codeId: ", codeId);

  const contractCodeHash = (
    await secretjs.query.compute.codeHashByCodeId({ code_id: codeId })
  ).code_hash;
  console.log(`Contract hash: ${contractCodeHash}`);

  return { codeId, contractCodeHash };
};

let instantiate_contract = async (codeId, contractCodeHash) => {
  const initMsg = { total_deposit: 0 };
  let tx = await secretjs.tx.compute.instantiateContract(
    {
      code_id: codeId,
      sender: wallet.address,
      code_hash: contractCodeHash,
      init_msg: initMsg,
      label: "secret raffle " + Math.ceil(Math.random() * 10000),
    },
    {
      gasLimit: 400_000,
    }
  );
  console.log(tx);
  const contractAddress = tx.arrayLog.find(
    (log) => log.type === "message" && log.key === "contract_address"
  ).value;

  console.log(`Contract Address: ${contractAddress}`);
  return contractAddress;
};

let handle_deposit = async (contractAddress, contractCodeHash, amount) => {
  const tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
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

let handle_record_contribution = async (contractAddress, contractCodeHash, score) => {
  const tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
      contract_address: contractAddress,
      msg: {
        record_contribution: {
          sender: "secret1q42qnccxnrgnuy9ge92xs5kuyvxr4gweaa896c",
          score: score,
        },
      },
      code_hash: contractCodeHash,
    },
    { gasLimit: 100_000 }
  );

  console.log(tx);
};

let handle_distribute_profit = async (contractAddress, contractCodeHash) => {
  const tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
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

let handle_record_total_profit = async (contractAddress, contractCodeHash, totalProfit) => {
  const tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
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

let handle_set_global_model_cid = async (contractAddress, contractCodeHash, cid) => {
  const tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
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

let handle_query_global_model_cid = async (contractAddress, contractCodeHash) => {
  let tx = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    code_hash: contractCodeHash,
    query: {
      get_global_model_c_i_d: {},
    },
  });
  console.log(tx);
};

let handle_query_contribution_score = async (contractAddress, contractCodeHash, sender) => {
  let tx = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    code_hash: contractCodeHash,
    query: {
      get_contribution_score: {
        sender: sender,
      },
    },
  });
  console.log(tx);
};

let handle_query_profit_distribution = async (contractAddress, contractCodeHash) => {
  let tx = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    code_hash: contractCodeHash,
    query: {
      get_profit_distribution: {},
    },
  });
  console.log(tx);
};

let handle_query_total_deposit = async (contractAddress, contractCodeHash) => {
  let tx = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    code_hash: contractCodeHash,
    query: {
      get_total_deposit: {},
    },
  });
  console.log(tx);
};

// Main function to run all tasks sequentially
const main = async () => {
  try {
    // const { codeId, contractCodeHash } = await upload_contract();
    // const contractAddress = await instantiate_contract(codeId, contractCodeHash);
    // await handle_set_global_model_cid(contractAddress, contractCodeHash, "example_cid");
    // await handle_query_global_model_cid(contractAddress, contractCodeHash);
    await handle_query_profit_distribution(contractAddress, contractCodeHash);
    // await handle_query_contribution_score(contractAddress, contractCodeHash, wallet.address);
    // Example total profit to distribute
    const totalProfit = 1000; // Set this to the actual profit you want to distribute
    await handle_record_total_profit(contractAddress, contractCodeHash, totalProfit);
    // await handle_distribute_profit(contractAddress, contractCodeHash);
  } catch (error) {
    console.error("Error occurred:", error);
  }
};

// Run the main function
main();
