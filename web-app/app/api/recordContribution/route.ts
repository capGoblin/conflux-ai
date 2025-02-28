import { NextRequest, NextResponse } from "next/server";
import { SecretNetworkClient, Wallet } from "secretjs";

const contractCodeHash =
  "11f591e2f9cebdc743915c1e92be82a9b256d527a31a914fc807063fa111c0c5";
const contractAddress = "secret15hfa4y3skxyc0kpy9hy0m3gwlvhcv7ftet9ctq";
const wallet = new Wallet(
  "radar injury pond there dad trick language ritual domain supreme tell ring"
);

export async function POST(req: NextRequest) {
  try {
    const contributions = await req.json(); // Expecting an array of { traderAddress, contribution }

    // Check if contributions is an array
    if (!Array.isArray(contributions)) {
      return NextResponse.json(
        { error: "Invalid data format. Expected an array." },
        { status: 400 }
      );
    }

    const secretjs = new SecretNetworkClient({
      chainId: "pulsar-3",
      url: "https://pulsar.lcd.secretnodes.com",
      wallet: wallet,
      walletAddress: wallet.address,
    });

    // Process each contribution individually without a loop
    if (contributions.length > 0) {
      const contributionData = contributions[0]; // Get the first contribution
      const { traderAddress, contribution } = contributionData;

      if (!traderAddress || contribution === undefined) {
        throw new Error("Trader address or contribution is undefined.");
      }

      // Execute the contract for the first contribution
      await secretjs.tx.compute.executeContract(
        {
          sender: wallet.address,
          contract_address: contractAddress,
          msg: {
            record_contribution: {
              sender: traderAddress,
              score: contribution,
            },
          },
          code_hash: contractCodeHash,
        },
        { gasLimit: 100_000 }
      );

      return NextResponse.json(
        { message: "Contribution recorded successfully." },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "No contributions provided." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing contributions:", error);
    return NextResponse.json(
      { error: "Failed to record contributions." },
      { status: 500 }
    );
  }
}
