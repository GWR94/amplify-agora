/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createMarket = `mutation CreateMarket(
  $input: CreateMarketInput!
  $condition: ModelMarketConditionInput
) {
  createMarket(input: $input, condition: $condition) {
    id
    name
    products {
      items {
        id
        description
        file {
          bucket
          region
          key
        }
        market {
          id
          name
          tags
          owner
          createdAt
        }
        price
        shipped
        owner
        createdAt
      }
      nextToken
    }
    tags
    owner
    createdAt
  }
}
`;
export const updateMarket = `mutation UpdateMarket(
  $input: UpdateMarketInput!
  $condition: ModelMarketConditionInput
) {
  updateMarket(input: $input, condition: $condition) {
    id
    name
    products {
      items {
        id
        description
        file {
          bucket
          region
          key
        }
        market {
          id
          name
          tags
          owner
          createdAt
        }
        price
        shipped
        owner
        createdAt
      }
      nextToken
    }
    tags
    owner
    createdAt
  }
}
`;
export const deleteMarket = `mutation DeleteMarket(
  $input: DeleteMarketInput!
  $condition: ModelMarketConditionInput
) {
  deleteMarket(input: $input, condition: $condition) {
    id
    name
    products {
      items {
        id
        description
        file {
          bucket
          region
          key
        }
        market {
          id
          name
          tags
          owner
          createdAt
        }
        price
        shipped
        owner
        createdAt
      }
      nextToken
    }
    tags
    owner
    createdAt
  }
}
`;
export const createProduct = `mutation CreateProduct(
  $input: CreateProductInput!
  $condition: ModelProductConditionInput
) {
  createProduct(input: $input, condition: $condition) {
    id
    description
    file {
      bucket
      region
      key
    }
    market {
      id
      name
      products {
        items {
          id
          description
          price
          shipped
          owner
          createdAt
        }
        nextToken
      }
      tags
      owner
      createdAt
    }
    price
    shipped
    owner
    createdAt
  }
}
`;
export const updateProduct = `mutation UpdateProduct(
  $input: UpdateProductInput!
  $condition: ModelProductConditionInput
) {
  updateProduct(input: $input, condition: $condition) {
    id
    description
    file {
      bucket
      region
      key
    }
    market {
      id
      name
      products {
        items {
          id
          description
          price
          shipped
          owner
          createdAt
        }
        nextToken
      }
      tags
      owner
      createdAt
    }
    price
    shipped
    owner
    createdAt
  }
}
`;
export const deleteProduct = `mutation DeleteProduct(
  $input: DeleteProductInput!
  $condition: ModelProductConditionInput
) {
  deleteProduct(input: $input, condition: $condition) {
    id
    description
    file {
      bucket
      region
      key
    }
    market {
      id
      name
      products {
        items {
          id
          description
          price
          shipped
          owner
          createdAt
        }
        nextToken
      }
      tags
      owner
      createdAt
    }
    price
    shipped
    owner
    createdAt
  }
}
`;
export const registerUser = `mutation RegisterUser(
  $input: CreateUserInput!
  $condition: ModelUserConditionInput
) {
  registerUser(input: $input, condition: $condition) {
    id
    username
    email
    registered
    orders {
      items {
        id
        product {
          id
          description
          price
          shipped
          owner
          createdAt
        }
        user {
          id
          username
          email
          registered
        }
        shippingAddress {
          city
          country
          address_line1
          address_state
          address_zip
        }
        createdAt
      }
      nextToken
    }
  }
}
`;
export const updateUser = `mutation UpdateUser(
  $input: UpdateUserInput!
  $condition: ModelUserConditionInput
) {
  updateUser(input: $input, condition: $condition) {
    id
    username
    email
    registered
    orders {
      items {
        id
        product {
          id
          description
          price
          shipped
          owner
          createdAt
        }
        user {
          id
          username
          email
          registered
        }
        shippingAddress {
          city
          country
          address_line1
          address_state
          address_zip
        }
        createdAt
      }
      nextToken
    }
  }
}
`;
export const createOrder = `mutation CreateOrder(
  $input: CreateOrderInput!
  $condition: ModelOrderConditionInput
) {
  createOrder(input: $input, condition: $condition) {
    id
    product {
      id
      description
      file {
        bucket
        region
        key
      }
      market {
        id
        name
        products {
          nextToken
        }
        tags
        owner
        createdAt
      }
      price
      shipped
      owner
      createdAt
    }
    user {
      id
      username
      email
      registered
      orders {
        items {
          id
          createdAt
        }
        nextToken
      }
    }
    shippingAddress {
      city
      country
      address_line1
      address_state
      address_zip
    }
    createdAt
  }
}
`;
