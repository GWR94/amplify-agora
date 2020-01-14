import React from "react";
import { Storage, Auth, API, graphqlOperation } from "aws-amplify";
import {
  Form,
  Button,
  Input,
  Notification,
  Radio,
  Progress
} from "element-react";
import { PhotoPicker } from "aws-amplify-react";
import { createProduct } from "../graphql/mutations";
import awsExports from "../aws-exports";
import { convertPoundsToPence } from "../utils/index";

const initialState = {
  desc: "",
  shipped: true,
  imagePreview: "",
  price: "",
  image: null,
  isUploading: false,
  percentUploaded: 0
};
class NewProduct extends React.Component {
  state = { ...initialState };

  handleAddProduct = async () => {
    const { image, desc, shipped, price } = this.state;
    const { marketId } = this.props;
    try {
      this.setState({ isUploading: true });
      const visibility = "public";
      const { identityId } = await Auth.currentCredentials();
      const filename = `/${visibility}/${identityId}/${Date.now()}-${
        image.name
      }`;
      const uploadedFile = await Storage.put(filename, image.file, {
        contentType: image.type,
        progressCallback: progress => {
          const percentUploaded = Math.round(
            (progress.loaded / progress.total) * 100
          );
          this.setState({ percentUploaded });
        }
      });
      const file = {
        key: uploadedFile.key,
        bucket: awsExports.aws_user_files_s3_bucket,
        region: awsExports.aws_project_region
      };
      const input = {
        productMarketId: marketId,
        description: desc,
        shipped,
        price: convertPoundsToPence(price),
        file,
        createdAt: new Date()
      };
      console.log(input);
      const res = await API.graphql(graphqlOperation(createProduct, { input }));
      console.log("Created Product", res);
      Notification({
        title: "Success",
        message: "Product successfully created",
        type: "success"
      });
      this.setState({ ...initialState });
    } catch (err) {
      console.error("Error creating product", err);
    }
  };

  render() {
    const {
      shipped,
      imagePreview,
      desc,
      price,
      image,
      isUploading,
      percentUploaded
    } = this.state;
    return (
      <div className="flex-center">
        <h2 className="header">Add New Product</h2>
        <div>
          <Form className="market-header">
            <Form.Item label="Add Product Description">
              <Input
                type="text"
                icon="information"
                placeholder="Description"
                value={desc}
                onChange={desc => this.setState({ desc })}
              />
            </Form.Item>
            <Form.Item label="Set Product Price">
              <Input
                type="number"
                icon="plus"
                value={price}
                placeholder="Price (£GBP)"
                onChange={price => this.setState({ price: parseFloat(price) })}
              />
            </Form.Item>
            <Form.Item label="Is the product shipped or emailed to the customer?">
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
            {imagePreview && (
              <img
                className="image-preview"
                src={imagePreview}
                alt="Product Preview"
              />
            )}
            {percentUploaded > 0 && (
              <Progress
                type="circle"
                className="progress"
                status="success"
                percentage={percentUploaded}
              />
            )}
            <PhotoPicker
              title="Product Image"
              preview="hidden"
              onLoad={url => this.setState({ imagePreview: url })}
              onPick={file => {
                console.log(file);
                this.setState({ image: file });
              }}
              theme={{
                formContainer: {
                  margin: 0,
                  padding: "0.8em"
                },
                formSection: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center"
                },
                sectionBody: {
                  margin: "0 0 10px",
                  width: "250px"
                },
                sectionHeader: {
                  padding: "0.2em",
                  color: "var(--darkAmazonOrange)"
                }
              }}
            />
            <Form.Item>
              <Button
                disabled={!image || !desc || !price || isUploading}
                type="primary"
                onClick={this.handleAddProduct}
                loading={isUploading}
              >
                {isUploading ? "Uploading..." : "Add Product"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}

export default NewProduct;
