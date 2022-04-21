import test from "ava";
import {
    Transaction,
    TransactionModifier,
} from "../../../../src";

test("incrementalAuth amount", (t) => {
    t.plan(4);
    const amount = 10;
    const transactionId="123456"
    const  obj= Transaction.fromId(transactionId).incrementalAuth(amount);
    t.truthy(obj);
    t.is(obj.paymentMethod.transactionId, transactionId);
    t.is(obj.amount, amount);
    t.is(obj.transactionModifier, TransactionModifier.Incremental);
});