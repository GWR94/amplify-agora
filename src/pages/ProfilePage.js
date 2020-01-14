/* eslint-disable linebreak-style */
import React from "react";
import { API, Auth, graphqlOperation } from "aws-amplify";
import {
  Table,
  Button,
  Notification,
  MessageBox,
  Message,
  Tabs,
  Icon,
  Form,
  Dialog,
  Input,
  Card,
  Tag
} from "element-react";
import dayjs from "dayjs";
import { getUser } from "../graphql/queries";
import { convertPenceToPounds } from "../utils/index";

class ProfilePage extends React.Component {
  state = {
    email: this.props.userAttributes && this.props.userAttributes.email,
    emailDialog: false,
    columns: [
      {
        prop: "name",
        width: "150"
      },
      {
        prop: "value",
        width: "330"
      },
      {
        prop: "tag",
        width: "150",
        render: row => {
          if (row.name === "Email") {
            const verified = this.props.userAttributes.email_verified;
            return verified ? (
              <Tag type="success">Verified</Tag>
            ) : (
              <Tag type="danger">Unverified</Tag>
            );
          }
        }
      },
      {
        prop: "operations",
        render: row => {
          switch (row.name) {
            case "Email":
              return (
                <Button
                  type="info"
                  onClick={() => this.setState({ emailDialog: true })}
                  size="small"
                >
                  Edit
                </Button>
              );
            case "Delete Profile":
              return (
                <Button
                  onClick={this.handleDeleteProfile}
                  type="danger"
                  size="small"
                >
                  Delete
                </Button>
              );
            default:
              break;
          }
        }
      }
    ],
    orders: [],
    verificationCode: "",
    verificationForm: false
  };

  componentDidMount() {
    if (this.props.userAttributes) {
      this.getUserOrders(this.props.userAttributes.sub);
    }
  }

  getUserOrders = async userId => {
    const res = await API.graphql(graphqlOperation(getUser, { id: userId }));
    this.setState({ orders: res.data.getUser.orders.items });
  };

  handleUpdateEmail = async () => {
    const { userAttributes, user } = this.props;
    const { email } = this.state;
    if (email === userAttributes.email && userAttributes.email_verified) {
      return Message({
        type: "info",
        customClass: "message",
        message:
          "The email address is already your current email address and is verified"
      });
    }
    try {
      const updatedAttributes = {
        email
      };
      const result = await Auth.updateUserAttributes(user, updatedAttributes);
      if (result === "SUCCESS") {
        this.sendVerificationCode("email");
      }
    } catch (err) {
      console.error(err);
      Notification.error({
        title: "Error",
        message: err.message || "Error updating email"
      });
    }
  };

  sendVerificationCode = async attr => {
    const { email } = this.state;
    await Auth.verifyCurrentUserAttribute(attr);
    this.setState({ verificationForm: true });
    Message({
      type: "info",
      customClass: "message",
      message: `Verification code sent to ${email}`
    });
  };

  handleVerifyEmail = async attr => {
    const { verificationCode } = this.state;
    try {
      await Auth.verifyCurrentUserAttributeSubmit(attr, verificationCode);
      Notification({
        title: "Success",
        message: "Email successfully verified",
        type: "success"
      });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      Notification.error({
        title: "Error",
        message: err.message || "Error updating email"
      });
    }
  };

  handleDeleteProfile = () => {
    const { user } = this.props;
    MessageBox.confirm(
      "This will permanently delete your account. Continue?",
      "Attention!",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning"
      }
    )
      .then(async () => {
        try {
          await user.deleteUser();
        } catch (err) {
          console.error(err);
          Notification.error({
            message: "Failed to delete profile, please try again"
          });
        }
      })
      .catch(() => {
        Message({
          type: "info",
          message: "Delete cancelled"
        });
      });
  };

  render() {
    const {
      orders,
      columns,
      email,
      emailDialog,
      verificationForm,
      verificationCode
    } = this.state;
    const { user, userAttributes } = this.props;
    return (
      userAttributes && (
        <>
          <Tabs activeName="1" className="profile-tabs">
            <Tabs.Pane
              label={
                <>
                  <Icon name="document" className="icon" />
                  Summary
                </>
              }
              name="1"
            >
              <h2 className="header">Profile Summary</h2>
              <Table
                columns={columns}
                data={[
                  {
                    name: "Your Id",
                    value: userAttributes.sub
                  },
                  {
                    name: "Username",
                    value: user.username
                  },
                  {
                    name: "Email",
                    value: userAttributes.email
                  },
                  {
                    name: "Phone Number",
                    value: userAttributes.phone_number
                  },
                  {
                    name: "Delete Profile",
                    value: "Sorry to see you go"
                  }
                ]}
                showHeader={false}
                rowClassName={row =>
                  row.name === "Delete Profile" && "delete-profile"
                }
              />
            </Tabs.Pane>
            <Tabs.Pane
              label={
                <>
                  <Icon name="message" className="icon" />
                  Orders
                </>
              }
              name="2"
            >
              <h2 className="header">Order History</h2>
              {orders.map(order => (
                <div className="mb-1" key={order.id}>
                  <Card>
                    <pre>
                      <p>Order Id: {order.id}</p>
                      <p>Product Description: {order.product.description}</p>
                      <p>Price: ${convertPenceToPounds(order.product.price)}</p>
                      <p>
                        Purchased on{" "}
                        {dayjs(order.createdAt).format("DD MMMM YYYY @ HH:mm")}
                      </p>
                      {order.shippingAddress && (
                        <div className="ml-2">
                          <p>{order.shippingAddress.address_line1}</p>
                          <p>
                            {order.shippingAddress.city},
                            {order.shippingAddress.address_state},
                            {order.shippingAddress.country},
                            {order.shippingAddress.zip}
                          </p>
                        </div>
                      )}
                    </pre>
                  </Card>
                </div>
              ))}
            </Tabs.Pane>
          </Tabs>
          <Dialog
            size="large"
            customClass="dialog"
            title="Edit Email"
            visible={emailDialog}
            onCancel={() => this.setState({ emailDialog: false })}
          >
            <Dialog.Body>
              <Form labelPosition="top">
                <Form.Item label="email">
                  <Input
                    value={email}
                    onChange={email => this.setState({ email })}
                  />
                </Form.Item>
                {verificationForm && (
                  <Form.Item label="Enter verification code" labelWidth="120">
                    <Input
                      onChange={verificationCode =>
                        this.setState({ verificationCode })
                      }
                      value={verificationCode}
                    />
                  </Form.Item>
                )}
              </Form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={() => this.setState({ emailDialog: false })}>
                Cancel
              </Button>
              {!verificationForm ? (
                <Button type="primary" onClick={this.handleUpdateEmail}>
                  Save
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={() => this.handleVerifyEmail("email")}
                >
                  Submit
                </Button>
              )}
            </Dialog.Footer>
          </Dialog>
        </>
      )
    );
  }
}

export default ProfilePage;
