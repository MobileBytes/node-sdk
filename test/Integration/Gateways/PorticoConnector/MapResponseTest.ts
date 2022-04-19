import test from "ava";
import {
  PorticoConnector,
  AuthorizationBuilder,
  TransactionType,
  DuplicateError,
  TransactionBuilder,
  Transaction,
} from "../../../../src";

class PorticoConnectorWrapperTest extends PorticoConnector {
  public mapResponse(
    rawResponse: string,
    builder: TransactionBuilder<Transaction>,
  ): Transaction {
    return super.mapResponse(rawResponse, builder);
  }
}

const porticoConnectorWrapperTest = new PorticoConnectorWrapperTest();
const rawResponse = `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
      <soap:Body>
          <PosResponse rootUrl="https://posgateway.cert.secureexchange.net/Hps.Exchange.PosGateway" xmlns="http://Hps.Exchange.PosGateway">
              <Ver1.0>
                  <Header>
                      <LicenseId>0000</LicenseId>
                      <SiteId>123456</SiteId>
                      <DeviceId>123456</DeviceId>
                      <GatewayTxnId>1234567</GatewayTxnId>
                      <GatewayRspCode>2</GatewayRspCode>
                      <GatewayRspMsg>Transaction was rejected because it is a duplicate. Subject '000000000'.</GatewayRspMsg>
                      <RspDT>2022-04-06T02:34:04.4528937</RspDT>
                      <AdditionalDuplicateData>
                          <OriginalGatewayTxnId>1234567</OriginalGatewayTxnId>
                          <OriginalRspDT>2022-04-06T02:32:50.083</OriginalRspDT>
                          <OriginalAuthCode>123456</OriginalAuthCode>
                          <OriginalRefNbr>123456789</OriginalRefNbr>
                          <OriginalAuthAmt>28.77</OriginalAuthAmt>
                          <OriginalCardType>Disc</OriginalCardType>
                          <OriginalCardNbrLast4>1234</OriginalCardNbrLast4>
                      </AdditionalDuplicateData>
                  </Header>
              </Ver1.0>
          </PosResponse>
      </soap:Body>
  </soap:Envelope>`;

const authorizationBuilder = new AuthorizationBuilder(
  TransactionType.Auth,
).withAmount(10);

test("transaction duplicate", (t) => {
  const error = t.throws(() => {
    return porticoConnectorWrapperTest.mapResponse(
      rawResponse,
      authorizationBuilder,
    );
  }, DuplicateError);

  t.is(error.name, "DuplicateError");
  t.is(error.responseCode, "2");
  t.truthy(error.additionalDuplicateData);
  t.is(error.additionalDuplicateData.originalGatewayTxnId, "1234567");
  t.is(error.additionalDuplicateData.originalRspDT, "2022-04-06T02:32:50.083");
  t.is(error.additionalDuplicateData.originalAuthCode, "123456");
  t.is(error.additionalDuplicateData.originalRefNbr, "123456789");
  t.is(error.additionalDuplicateData.originalAuthAmt, "28.77");
  t.is(error.additionalDuplicateData.originalCardType, "Disc");
  t.is(error.additionalDuplicateData.originalCardNbrLast4, "1234");
  t.true(-1 !== error.message.indexOf("Transaction Duplicate exception"));
});
