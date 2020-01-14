import React from "react";
import { S3Image } from "aws-amplify-react";
import { API, graphqlOperation } from "aws-amplify";
import { Link } from "react-router-dom";
import {
  Notification,
  Popover,
  Button,
  Dialog,
  Card,
  Form,
  Input,
  Radio
} from "element-react";
import { convertPenceToPounds, convertPoundsToPence } from "../utils/index";
import { UserContext } from "../App";
import PayButton from "./PayButton";
import { updateProduct, deleteProduct } from "../graphql/mutations";

class Product extends React.Component {
  state = {
    updatedProductDialog: false,
    deleteProductPopover: false,
    desc: "",
    price: "",
    shipped: false
  };

  handleUpdateProduct = async productId => {
    try {
      this.setState({ updatedProductDialog: false });
      const { desc, price, shipped } = this.state;
      const input = {
        id: productId,
        description: desc,
        price: convertPoundsToPence(price),
        shipped
      };
      const res = await API.graphql(graphqlOperation(updateProduct, { input }));
      console.log(res);
      Notification({
        title: "Success",
        type: "success",
        message: "Product successfully updated!"
      });
    } catch (err) {
      Notification({
        title: "Error",
        type: "error",
        message: "Failed to update product, please see console for details."
      });
      console.error(err);
    }
  };

  handleDeleteProduct = async productId => {
    try {
      this.setState({ deleteProductPopover: false });
      const res = await API.graphql(
        graphqlOperation(deleteProduct, { input: { id: productId } })
      );
      console.log(res);
      Notification({
        title: "Success",
        type: "success",
        message: "Product successfully removed!"
      });
    } catch (err) {
      Notification({
        title: "Error",
        type: "error",
        message: "Failed to remove product, please see console for details."
      });
      console.error(err);
    }
  };

  render() {
    const { product } = this.props;
    const {
      updatedProductDialog,
      deleteProductPopover,
      desc,
      shipped,
      price
    } = this.state;
    return (
      <UserContext.Consumer>
        {({ userAttributes }) => {
          const isProductOwner =
            userAttributes && userAttributes.sub === product.owner;
          const isEmailVerified =
            userAttributes && userAttributes.email_verified;

          return (
            <div className="card-container">
              <Card bodyStyle={{ padding: 0, minWidth: "200px" }}>
                <S3Image
                  imgKey={product.file.key}
                  theme={{
                    photoImg: { maxWidth: "100%", maxHeight: "100%" }
                  }}
                />
                <div className="card-body">
                  <h3 className="m-0">{product.description}</h3>
                  <div className="items-center">
                    <img
                      src={`https://icon.now.sh/${
                        product.shipped ? "markunread_mailbox" : "mail"
                      }`}
                      alt="Shipping Icon"
                      className="icon"
                    />
                    {product.shipped ? "Shipped" : "Emailed"}
                  </div>
                  <div className="text-right">
                    <span className="m-1">
                      £{convertPenceToPounds(product.price)}
                    </span>
                    {isEmailVerified ? (
                      !isProductOwner && (
                        <PayButton
                          product={product}
                          userAttributes={userAttributes}
                        />
                      )
                    ) : (
                      <Link to="/profile" className="link">
                        Verify Email
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
              <div className="text-center">
                {isProductOwner && (
                  <>
                    <Button
                      type="warning"
                      icon="edit"
                      size="small"
                      className="m-1"
                      onClick={() =>
                        this.setState({
                          updatedProductDialog: true,
                          desc: product.description,
                          shipped: product.shipped,
                          price: convertPenceToPounds(product.price)
                        })
                      }
                    >
                      Edit
                    </Button>
                    <Popover
                      placement="top"
                      width="160"
                      trigger="click"
                      visible={deleteProductPopover}
                      content={
                        <>
                          <p>Do you want to delete this?</p>
                          <div className="text-right">
                            <Button
                              size="mini"
                              type="text"
                              className="m-1"
                              onClick={() =>
                                this.setState({ deleteProductPopover: false })
                              }
                            >
                              Cancel
                            </Button>
                            <Button
                              type="primary"
                              size="mini"
                              className="m-1"
                              onClick={() =>
                                this.handleDeleteProduct(product.id)
                              }
                            >
                              Confirm
                            </Button>
                          </div>
                        </>
                      }
                    >
                      <Button
                        type="danger"
                        icon="delete"
                        size="small"
                        onClick={() =>
                          this.setState({
                            deleteProductPopover: true
                          })
                        }
                      >
                        Remove
                      </Button>
                    </Popover>
                  </>
                )}
              </div>
              <Dialog
                title="Update Product"
                size="large"
                customClass="dialog"
                visible={updatedProductDialog}
                onCancel={() => this.setState({ updatedProductDialog: false })}
              >
                <Dialog.Body>
                  <Form labelPosition="top">
                    <Form.Item label="Update Product Description">
                      <Input
                        icon="information"
                        placeholder="Product Description"
                        value={desc}
                        trim
                        onChange={desc => this.setState({ desc })}
                      />
                    </Form.Item>
                    <Form.Item label="Update Price">
                      <Input
                        type="number"
                        icon="plus"
                        value={price}
                        placeholder="Price (£GBP)"
                        onChange={price =>
                          this.setState({ price: parseFloat(price) })
                        }
                      />
                    </Form.Item>
                    <Form.Item label="Update Shipping">
                      <div className="text-center">
                        <Radio
                          value="true"
                          checked={shipped}
                          onChange={() => this.setState({ shipped: true })}
                        >
                          Shipped
                        </Radio>
                        <Radio
                          value="false"
                          checked={!shipped}
                          onChange={() => this.setState({ shipped: false })}
                        >
                          Emailed
                        </Radio>
                      </div>
                    </Form.Item>
                  </Form>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button
                    onClick={() =>
                      this.setState({ updatedProductDialog: false })
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => this.handleUpdateProduct(product.id)}
                  >
                    Update
                  </Button>
                </Dialog.Footer>
              </Dialog>
            </div>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

export default Product;
