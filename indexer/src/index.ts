import { ponder } from "@/generated";
import {
  spinCompleted,
  spinRefunded,
  spinReclaimed,
  nftDeposited,
} from "../ponder.schema";

ponder.on("Gacha:SpinCompleted", async ({ event, context }) => {
  await context.db.insert(spinCompleted).values({
    id: `${event.log.transactionHash}-${event.log.logIndex}`,
    triggerId: event.args.triggerId.toString(),
    requester: event.args.requester.toLowerCase(),
    rarity: event.args.rarity,
    collection: event.args.collection.toLowerCase(),
    tokenId: event.args.tokenId.toString(),
    appraisedPrice: event.args.appraisedPrice.toString(),
    blockNumber: Number(event.block.number),
    txHash: event.log.transactionHash,
    logIndex: event.log.logIndex,
    timestamp: Number(event.block.timestamp),
  });
});

ponder.on("Gacha:SpinRefunded", async ({ event, context }) => {
  await context.db.insert(spinRefunded).values({
    id: `${event.log.transactionHash}-${event.log.logIndex}`,
    triggerId: event.args.triggerId.toString(),
    requester: event.args.requester.toLowerCase(),
    selectedRarity: event.args.selectedRarity,
    refundAmount: event.args.refundAmount.toString(),
    blockNumber: Number(event.block.number),
    txHash: event.log.transactionHash,
    logIndex: event.log.logIndex,
    timestamp: Number(event.block.timestamp),
  });
});

ponder.on("Gacha:SpinReclaimed", async ({ event, context }) => {
  await context.db.insert(spinReclaimed).values({
    id: `${event.log.transactionHash}-${event.log.logIndex}`,
    triggerId: event.args.triggerId.toString(),
    requester: event.args.requester.toLowerCase(),
    refundAmount: event.args.refundAmount.toString(),
    blockNumber: Number(event.block.number),
    txHash: event.log.transactionHash,
    logIndex: event.log.logIndex,
    timestamp: Number(event.block.timestamp),
  });
});

ponder.on("GachaTreasury:NFTDeposited", async ({ event, context }) => {
  await context.db.insert(nftDeposited).values({
    id: `${event.log.transactionHash}-${event.log.logIndex}`,
    collection: event.args.collection.toLowerCase(),
    tokenId: event.args.tokenId.toString(),
    depositor: event.args.depositor.toLowerCase(),
    rarity: event.args.rarity,
    appraisedPrice: event.args.appraisedPrice.toString(),
    blockNumber: Number(event.block.number),
    txHash: event.log.transactionHash,
    logIndex: event.log.logIndex,
    timestamp: Number(event.block.timestamp),
  });
});
