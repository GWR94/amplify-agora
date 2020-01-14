import React from "react";
import { API, graphqlOperation } from "aws-amplify";
import { Loading, Tabs, Icon } from "element-react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import advanced from "dayjs/plugin/advancedFormat";
import {
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct
} from "../graphql/subscriptions";
import { getMarket } from "../graphql/queries";
import NewProduct from "../components/NewProduct";
import Product from "../components/Product";

dayjs.extend(advanced);

class MarketPage extends React.Component {
  state = {
    market: null,
    isLoading: true,
    isMarketOwner: false,
    isEmailVerified: false
  };

  componentDidMount() {
    this.handleGetMarket();
    this.createSubscriptions();
  }

  componentWillUnmount() {
    this.deleteProductListener.unsubscribe();
    this.createProductListener.unsubscribe();
    this.updateProductListener.unsubscribe();
  }

  createSubscriptions = () => {
    const { market } = this.state;
    const { user } = this.props;
    const {
      attributes: { sub }
    } = user;
    this.createProductListener = API.graphql(
      graphqlOperation(onCreateProduct, { owner: sub })
    ).subscribe({
      next: productData => {
        const createdProduct = productData.value.data.onCreateProduct;
        const prevProducts = market.products.items.filter(
          item => item.id !== createdProduct.id
        );
        const updatedProducts = [createdProduct, ...prevProducts];
        const updatedMarket = { ...market };
        market.products.items = updatedProducts;
        this.setState({ market: updatedMarket });
      }
    });
    this.updateProductListener = API.graphql(
      graphqlOperation(onUpdateProduct, { owner: sub })
    ).subscribe({
      next: productData => {
        const updatedProduct = productData.value.data.onUpdateProduct;
        const updatedProductIndex = market.products.items.findIndex(
          item => item.id === updatedProduct.id
        );
        const updatedProducts = [
          ...market.products.items.slice(0, updatedProductIndex),
          updatedProduct,
          ...market.products.items.slice(updatedProductIndex + 1)
        ];
        const updatedMarket = { ...market };
        market.products.items = updatedProducts;
        this.setState({ market: updatedMarket });
      }
    });
    this.deleteProductListener = API.graphql(
      graphqlOperation(onDeleteProduct, { owner: sub })
    ).subscribe({
      next: productData => {
        const deletedProduct = productData.value.data.onDeleteProduct;
        const updatedProducts = market.products.items.filter(
          item => item.id !== deletedProduct.id
        );
        const updatedMarket = { ...market };
        market.products.items = updatedProducts;
        this.setState({ market: updatedMarket });
      }
    });
  };

  checkMarketOwner = () => {
    const { user } = this.props;
    const { market } = this.state;
    if (user) this.setState({ isMarketOwner: user.username === market.owner });
  };

  checkEmailVerified = () => {
    const { userAttributes } = this.props;
    if (userAttributes) {
      this.setState({ isEmailVerified: userAttributes.email_verified });
    }
  };

  handleGetMarket = async () => {
    const { marketId } = this.props;
    const result = await API.graphql(
      graphqlOperation(getMarket, { id: marketId })
    );
    console.log(result);
    this.setState({ market: result.data.getMarket, isLoading: false }, () => {
      this.checkMarketOwner();
      this.checkEmailVerified();
    });
  };

  render() {
    const { isLoading, market, isMarketOwner, isEmailVerified } = this.state;
    const { marketId } = this.props;
    return isLoading ? (
      <Loading fullscreen />
    ) : (
      <>
        <Link className="link" to="/">
          Back to Markets List
        </Link>
        <span className="items-center pt-2">
          <h2 className="mb-mr">{market.name}</h2> - {market.owner}
        </span>
        <div className="items-center pt-2">
          <span style={{ color: "var(--lightSquidInk)", paddingBottom: "1em" }}>
            <Icon name="date" className="icon" />
            {dayjs(market.createdAt).format("dddd MMM Do YYYY")}
          </span>
        </div>
        <Tabs type="border-card" value={isMarketOwner ? "1" : "2"}>
          {isMarketOwner && (
            <Tabs.Pane
              label={
                <>
                  <Icon name="plus" className="icon" /> Add Product
                </>
              }
              name="1"
            >
              {isEmailVerified ? (
                <NewProduct marketId={marketId} />
              ) : (
                <Link to="/profile" className="header">
                  Verify your email before adding products
                </Link>
              )}
            </Tabs.Pane>
          )}
          <Tabs.Pane
            label={
              <>
                <Icon name="menu" className="icon" /> Product (
                {market.products.items.length})
              </>
            }
            name="2"
          >
            <div className="product-list">
              {market.products.items.map(product => (
                <Product key={product.id} product={product} />
              ))}
            </div>
          </Tabs.Pane>
        </Tabs>
      </>
    );
  }
}

export default MarketPage;
