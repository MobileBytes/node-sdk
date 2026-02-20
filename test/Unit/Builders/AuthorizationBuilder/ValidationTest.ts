import test from "ava";
import {
  CreditCardData,
  ECheck,
  GiftCard,
  PaymentMethod,
  ServicesConfig,
  ServicesContainer,
  UnsupportedTransactionError,
} from "../../../../src/";

const config = new ServicesConfig();
config.secretApiKey = "skapi_cert_MTeSAQAfG1UA9qQDrzl-kz4toXvARyieptFwSKP24w";
config.serviceUrl = "https://cert.api2-c.heartlandportico.com";

const card = new CreditCardData();
card.number = "4111111111111111";
card.expMonth = "12";
card.expYear = "2025";
card.cvn = "123";
card.cardHolderName = "Joe Smith";

const captureError = async (fn: () => Promise<any>) => {
  try {
    await fn();
    return null;
  } catch (err) {
    return err as Error;
  }
};

test.before((_t) => {
  ServicesContainer.configure(config);
});

test("credit auth no amount", async (t) => {
  t.plan(3);

  const error = await captureError(() => card.authorize().execute());

  t.truthy(error);
  t.is(error!.name, "BuilderError");
  t.true(-1 !== error!.message.indexOf("amount cannot be null"));
});

test("credit auth no currency", async (t) => {
  t.plan(3);

  const error = await captureError(() => card.authorize(14).execute());

  t.truthy(error);
  t.is(error!.name, "BuilderError");
  t.true(-1 !== error!.message.indexOf("currency cannot be null"));
});

test("credit sale no amount", async (t) => {
  t.plan(3);

  const error = await captureError(() => card.charge().execute());

  t.truthy(error);
  t.is(error!.name, "BuilderError");
  t.true(-1 !== error!.message.indexOf("amount cannot be null"));
});

test("credit sale no currency", async (t) => {
  t.plan(3);

  const error = await captureError(() => card.charge(14).execute());

  t.truthy(error);
  t.is(error!.name, "BuilderError");
  t.true(-1 !== error!.message.indexOf("currency cannot be null"));
});

test("credit sale no payment method", async (t) => {
  t.plan(3);

  const error = await captureError(() =>
    card
      .charge(14)
      .withCurrency("USD")
      .withPaymentMethod({} as PaymentMethod)
      .execute(),
  );

  t.true(error instanceof UnsupportedTransactionError);
  t.is(error!.name, "UnsupportedTransactionError");
  t.true(-1 !== error!.message.indexOf("not supported for this payment method"));
});

test("credit offline no amount", async (t) => {
  t.plan(3);

  const error = await captureError(() =>
    card
      .charge()
      .withOfflineAuthCode("123456")
      .execute(),
  );

  t.truthy(error);
  t.is(error!.name, "BuilderError");
  t.true(-1 !== error!.message.indexOf("amount cannot be null"));
});

test("credit offline no currency", async (t) => {
  t.plan(3);

  const error = await captureError(() =>
    card
      .charge(14)
      .withOfflineAuthCode("123456")
      .execute(),
  );

  t.truthy(error);
  t.is(error!.name, "BuilderError");
  t.true(-1 !== error!.message.indexOf("currency cannot be null"));
});

test("credit offline no auth code", async (t) => {
  t.plan(3);

  const error = await captureError(() =>
    card
      .charge(14)
      .withCurrency("USD")
      .withOfflineAuthCode("")
      .execute(),
  );

  t.truthy(error);
  t.is(error!.name, "BuilderError");
  t.true(-1 !== error!.message.indexOf("offlineAuthCode cannot be empty"));
});

test("gift replace no replacement card", async (t) => {
  t.plan(3);

  const error = await captureError(() => {
    const gift = new GiftCard();
    gift.alias = "1234567890";
    return gift.replaceWith(undefined).execute();
  });

  t.truthy(error);
  t.is(error!.name, "BuilderError");
  t.true(-1 !== error!.message.indexOf("replacementCard cannot be null"));
});

test("check sale no address", async (t) => {
  t.plan(3);

  const error = await captureError(() => {
    const check = new ECheck();
    return check
      .charge(14)
      .withCurrency("USD")
      .execute();
  });

  t.truthy(error);
  t.is(error!.name, "BuilderError");
  t.true(-1 !== error!.message.indexOf("billingAddress cannot be null"));
});
