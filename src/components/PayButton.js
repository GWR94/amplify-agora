import React from "react";
import StripeCheckout from "react-stripe-checkout";
import { API, graphqlOperation } from "aws-amplify";
import { Notification, Message } from "element-react";
import { getUser } from "../graphql/queries";
import { createOrder } from "../graphql/mutations";
import { history } from "../App";

const stripeConfig = {
  currency: "GBP",
  publishableAPIKey: "pk_test_JImjUqvnkycwrfXR3iXApakC"
};

const PayButton = ({ product, userAttributes }) => {
  const getOwnerEmail = async ownerId => {
    try {
      const input = { id: ownerId };
      const result = await API.graphql(graphqlOperation(getUser, input));
      return result.data.getUser.email;
    } catch (err) {
      console.error("Error fetching product owners' email", err);
    }
  };

  const createShippingAddress = source => ({
    city: source.address_city,
    country: source.address_country,
    address_line1: source.address_line1,
    address_state: source.address_state,
    address_zip: source.address_zip
  });

  const handleCharge = async token => {
    try {
      const ownerEmail = await getOwnerEmail(product.owner);
      const res = await API.post("orderlambda", "/charge", {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description
          },
          email: {
            customerEmail: userAttributes.email,
            ownerEmail,
            shipped: product.shipped
          }
        }
      });
      console.log({ res });
      if (res.charge.status === "succeeded") {
        let shippingAddress = null;
        if (product.shipped) {
          shippingAddress = createShippingAddress(res.charge.source);
        }
        const input = {
          orderUserId: userAttributes.sub,
          orderProductId: product.id,
          shippingAddress,
          createdAt: new Date()
        };
        const order = await API.graphql(
          graphqlOperation(createOrder, { input })
        );
        console.log(order);
        Notification({
          title: "Success",
          message: `${res.message}`,
          type: "success",
          duration: 3000
        });
        setTimeout(() => {
          history.push("/");
          Message({
            type: "info",
            message: "Check your verified email for order details",
            duration: 5000,
            showClose: true
          });
        }, 3000);
      }
    } catch (err) {
      console.error("Failed", err);
      Notification.error({
        title: "Error",
        message: `${err.message || "Error processing order"}`
      });
    }
  };

  return (
    <StripeCheckout
      token={handleCharge}
      email={userAttributes.email}
      name={product.description}
      amount={product.price}
      billingAddress={product.shipped}
      shippingAddress={product.shipped}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
      locale="auto"
    />
  );
};

export default PayButton;
