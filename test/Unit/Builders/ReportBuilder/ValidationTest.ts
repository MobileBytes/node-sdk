import test from "ava";
import { ReportingService, ServicesConfig, ServicesContainer } from "../../../../src/";

const config = new ServicesConfig();
config.secretApiKey = "skapi_cert_MTeSAQAfG1UA9qQDrzl-kz4toXvARyieptFwSKP24w";
config.serviceUrl = "https://cert.api2-c.heartlandportico.com";

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

test("report transaction details no transaction id", async (t) => {
  t.plan(3);

  const error = await captureError(() =>
    ReportingService.transactionDetail("").execute(),
  );

  t.truthy(error);
  t.is(error!.name, "BuilderError");
  t.true(-1 !== error!.message.indexOf("transactionId cannot be empty"));
});

test("report transaction details with device id", async (t) => {
  t.plan(3);

  const error = await captureError(() =>
    ReportingService.transactionDetail("1234567890")
      .withDeviceId("123456")
      .execute(),
  );

  t.truthy(error);
  t.is(error!.name, "BuilderError");
  t.true(-1 !== error!.message.indexOf("deviceId cannot be set"));
});

test("report transaction details with start date", async (t) => {
  t.plan(3);

  const error = await captureError(() =>
    ReportingService.transactionDetail("1234567890")
      .withStartDate(new Date())
      .execute(),
  );

  t.truthy(error);
  t.is(error!.name, "BuilderError");
  t.true(-1 !== error!.message.indexOf("startDate cannot be set"));
});

test("report transaction details with end date", async (t) => {
  t.plan(3);

  const error = await captureError(() =>
    ReportingService.transactionDetail("1234567890")
      .withEndDate(new Date())
      .execute(),
  );

  t.truthy(error);
  t.is(error!.name, "BuilderError");
  t.true(-1 !== error!.message.indexOf("endDate cannot be set"));
});

test("report activity with transaction id", async (t) => {
  t.plan(3);

  const error = await captureError(() =>
    ReportingService.activity()
      .withTransactionId("1234567890")
      .execute(),
  );

  t.truthy(error);
  t.is(error!.name, "BuilderError");
  t.true(-1 !== error!.message.indexOf("transactionId cannot be set"));
});
