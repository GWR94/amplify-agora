import React from "react";
import {
  Form,
  Button,
  Dialog,
  Input,
  Select,
  Notification
} from "element-react";
import { graphqlOperation, API } from "aws-amplify";
import { createMarket } from "../graphql/mutations";
import { UserContext } from "../App";

class NewMarket extends React.Component {
  state = {
    addMarketDialog: false,
    name: "",
    tags: [
      "Arts",
      "Photography",
      "Technology",
      "Crafts",
      "Entertainment",
      "Sports"
    ],
    selectedTags: [],
    options: []
  };

  handleAddMarket = async user => {
    const { selectedTags } = this.state;
    const { name } = this.state;
    try {
      const res = await API.graphql(
        graphqlOperation(createMarket, {
          input: {
            name,
            owner: user.username,
            createdAt: new Date(),
            tags: selectedTags
          }
        })
      );
      console.log(res);
    } catch (err) {
      console.log("Error adding market", err);
      Notification.error({
        title: "Error",
        message: `${err.message || "Error adding market"}`
      });
    }
    this.setState({ addMarketDialog: false, name: "", selectedTags: [] });
  };

  handleFilterTags = query => {
    const { tags } = this.state;
    const options = tags
      .map(tag => ({ value: tag, label: tag }))
      .filter(tag => tag.label.toLowerCase().includes(query.toLowerCase()));
    this.setState({ options });
  };

  render() {
    const {
      handleSearch,
      searchTerm,
      handleSearchChange,
      handleClearSearch,
      isSearching
    } = this.props;
    const { addMarketDialog, name, options } = this.state;
    return (
      <UserContext.Consumer>
        {({ user }) => (
          <>
            <div className="market-header">
              <h1 className="market-title">
                Create Marketplace
                <Button
                  type="text"
                  icon="edit"
                  className="market-title-button"
                  onClick={() => this.setState({ addMarketDialog: true })}
                />
              </h1>
              <Form inline onSubmit={handleSearch}>
                <Form.Item>
                  <Input
                    placeholder="Search Markets..."
                    icon="circle-cross"
                    onIconClick={handleClearSearch}
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="info"
                    loading={isSearching}
                    icon="search"
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <Dialog
              title="Create New Market"
              visible={addMarketDialog}
              onCancel={() => this.setState({ addMarketDialog: false })}
              size="large"
              customClass="dialog"
            >
              <Dialog.Body>
                <Form labelPosition="top">
                  <Form.Item label="Add Market Name">
                    <Input
                      placeholder="Market Name"
                      trim
                      onChange={name => this.setState({ name })}
                      value={name}
                    />
                  </Form.Item>
                  <Form.Item label="Add Tags">
                    <Select
                      multiple
                      filterable
                      placeholder="Market Tags"
                      onChange={tags => this.setState({ selectedTags: tags })}
                      remoteMethod={this.handleFilterTags}
                      remote
                    >
                      {options.map(option => (
                        <Select.Option
                          key={option.value}
                          label={option.label}
                          value={option.value}
                        />
                      ))}
                    </Select>
                  </Form.Item>
                </Form>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  onClick={() => this.setState({ addMarketDialog: false })}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  disabled={!name}
                  onClick={() => this.handleAddMarket(user)}
                >
                  Add
                </Button>
              </Dialog.Footer>
            </Dialog>
          </>
        )}
      </UserContext.Consumer>
    );
  }
}

export default NewMarket;
