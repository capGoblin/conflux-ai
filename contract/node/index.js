import { SecretNetworkClient, Wallet } from "secretjs";
import * as fs from "fs";
// import dotenv from "dotenv";
// dotenv.config();

const wallet = new Wallet("radar injury pond there dad trick language ritual domain supreme tell ring");

const contract_wasm = fs.readFileSync("../conflux-ai.wasm.gz");
const codeId = 13527;
const contractCodeHash =
  "69075ff23edb71f84aaf5c4ed6978cac74f2d925f8c989d9f2f7f5a2e924146f";
const contractAddress = "secret1s6e6n70kx5gkl8trs5edpp26atjfy4zy5e6hlh";

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
  const initMsg = { total_deposit: 1 };
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

let try_deposit = async (contractAddress, contractCodeHash) => {
  const tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
      contract_address: contractAddress,
      msg: {
        deposit: {
          amount: 50,
        },
      },
      code_hash: contractCodeHash,
    },
    { gasLimit: 100_000 }
  );

  console.log(tx);
};

let query_spin = async (contractAddress, contractCodeHash) => {
  let tx = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    code_hash: contractCodeHash,
    query: {
      get_raffle_number: {},
    },
  });
  console.log(tx);
};

let try_record_contribution = async (contractAddress, contractCodeHash) => {
  const tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
      contract_address: contractAddress,
      msg: {
        record_contribution: {
          sender: wallet.address,
          score: 2,
        },
      },
      code_hash: contractCodeHash,
    },
    { gasLimit: 100_000 }
  );

  console.log(tx);
};

let try_distribute_profit = async (contractAddress, contractCodeHash) => {
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

let try_record_total_profit = async (contractAddress, contractCodeHash, totalProfit) => {
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

// Main function to run all tasks sequentially
const main = async () => {
  try {
    const { codeId, contractCodeHash } = await upload_contract();
    const contractAddress = await instantiate_contract(codeId, contractCodeHash);
    await try_record_contribution(contractAddress, contractCodeHash);

    // Example total profit to distribute
    const totalProfit = 1000; // Set this to the actual profit you want to distribute
    await try_record_total_profit(contractAddress, contractCodeHash, totalProfit);
    await try_distribute_profit(contractAddress, contractCodeHash);
  } catch (error) {
    console.error("Error occurred:", error);
  }
};

// Run the main function
main();
