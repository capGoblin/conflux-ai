// contract/node/index.js

import { SecretNetworkClient, Wallet } from "secretjs";
import * as fs from "fs";

const wallet = new Wallet("digital adapt style blossom genre sense fold quiz frown city dutch emerge");

const contract_wasm = fs.readFileSync("./contract.wasm.gz");
let codeId; // Declare codeId here
let contractAddress; // Declare contractAddress here

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

  // Log the entire transaction response for debugging
  console.log("Transaction Response: ", tx);

  // Check if the log entry exists
  const codeIdLog = tx.arrayLog.find((log) => log.type === "message" && log.key === "code_id");
  if (codeIdLog) {
    codeId = Number(codeIdLog.value);
    console.log("codeId: ", codeId);
  } else {
    console.error("Failed to retrieve codeId from transaction logs.");
  }
};

let instantiate_contract = async () => {
  const initMsg = { total_deposit: 0 }; // Initialize with total deposit as 0
  let tx = await secretjs.tx.compute.instantiateContract(
    {
      code_id: codeId,
      sender: wallet.address,
      init_msg: initMsg,
      label: "conflux-ai",
    },
    {
      gasLimit: 400_000,
    }
  );

  contractAddress = tx.arrayLog.find(
    (log) => log.type === "message" && log.key === "contract_address"
  ).value;

  console.log("Contract Address: ", contractAddress);
};

let deposit = async (amount) => {
  const tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
      contract_address: contractAddress,
      msg: {
        deposit: { amount: amount },
      },
    },
    { gasLimit: 100_000 }
  );

  console.log("Deposit Transaction: ", tx);
};

// Call the functions as needed
(async () => {
  await upload_contract(); // Upload the contract
  await instantiate_contract(); // Instantiate the contract
  await deposit(1000000); // Example deposit amount
})();