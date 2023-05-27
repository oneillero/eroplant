const Header = () => {
  return (
    <header className="sticky-header">
      <h1 id="main-header" style={{ marginBottom: '20px' }}>ERO's Mini Plant Nursery</h1>
    </header>
  );
};

const products = [
  {
    name: "Rhododendrons:",
    country: "Bhutan",
    cost: 40,
    instock: 10,
  },
  {
    name: "Dogwoods:",
    country: "USA",
    cost: 30,
    instock: 15,
  },
  {
    name: "Lilacs:",
    country: "Romania",
    cost: 20,
    instock: 10,
  },
  {
    name: "Japanese Maples:",
    country: "Japan",
    cost: 60,
    instock: 5,
  },
];

// Cart component
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

// Data fetching
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

// Reducer to return the state of data fetch operation
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

// Products component
const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const { Card, Accordion, Button, Container, Row, Col, Image, Input } =
    ReactBootstrap;

  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/shop");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/shop",
    {
      data: [],
    }
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);

  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name === name && item.instock > 0);

    if (item[0].instock === 0)
      return alert("None available, time to re-stock!");

    const updatedStock = items.map((item) => {
      if (item.name === name) {
        item.instock--;
      }
      return item;
    });

    setItems(updatedStock);
    setCart([...cart, ...item]);
  };

  const deleteCartItem = (item, index) => {
    let newCart = cart.filter((item, i) => index !== i);
    for (const element of items) {
      if (element.name === item.name) {
        element.instock = element.instock + 1;
      }
    }
    setCart(newCart);
  };

  const photos = [
    "./images/Rhodie.png",
    "./images/dogwood.png",
    "./images/lilac.png",
    "./images/maple.png",
  ];

  let cardList = items.map((item, index) => {
    return (
      <Col key={index} md={12} className="mb-4">
        <Card>
          <Row g={0}>
            <Col md={6}>
              <div style={{ width: "40vw", height: "40vh", overflow: "hidden" }}>
                <Card.Img
                  src={photos[index % 4]}
                  className="img"
                  style={{
                    border: "10px dark green",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </Col>
            <Col md={6} className="d-flex">
              <Card.Body className="my-auto text-center">
                <Card.Title>{item.name}</Card.Title>
                <Card.Text>From: {item.country}</Card.Text>
                <Card.Text>
                  <small className="text-muted">
                    Quantity In Stock: {item.instock}
                  </small>
                </Card.Text>
                <Button
                  name={item.name}
                  type="submit"
                  onClick={addToCart}
                  variant="primary"
                  style={{
                    backgroundColor: "#222222",
                    border: "none",
                    outline: "none",
                  }}
                >
                  Add to Cart
                </Button>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </Col>
    );
  });

  let cartList = cart.map((item, index) => {
    return (
      <Accordion.Item key={1 + index} eventkey={1 + index}>
        <Accordion.Header>{item.name}</Accordion.Header>
        <Accordion.Body onClick={() => deleteCartItem(item, index)}>
          ${item.cost}
          <br />
          <br />
          <Button
            style={{
              backgroundColor: "#444444",
              border: "none",
              outline: "1px solid black",
            }}
          >
            Remove from Cart
          </Button>
          <br />
        </Accordion.Body>
      </Accordion.Item>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return <div key={index} index={index}></div>;
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`Total updated to ${newTotal}`);
    return newTotal;
  };

  const restockProducts = (url) => {
    doFetch(url);
    let newItems = data.map((item) => {
      let { name, country, cost, instock } = item;
      return { name, country, cost, instock };
    });
    setItems([...items, ...newItems]);
  };

  return (
    <Container>
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body style={{ textAlign: "center" }}>
              <h3>Welcome to Ero's Nursery</h3>
              <p>
                At Ero, we uphold the value of quality above all else. Explore
                our curated selection and discover how you can enrich your home
                with these stunning botanical wonders.
              </p>
            </Card.Body>
          </Card>
          <Card className="mb-4">
            <Card.Body style={{ textAlign: "center" }}>
              <h3>Restock Products</h3>
              <form
                onSubmit={(event) => {
                  restockProducts(query, event);
                  console.log(`New Restock called on ${query}`);
                  event.preventDefault();
                }}
              >
                <input
                  type="text"
                  value={query}
                  style={{ width: "100%" }}
                  onChange={(event) => {
                    setQuery(event.target.value);
                  }}
                />
                <Button
                  type="submit"
                  style={{
                    backgroundColor: "#444444",
                    border: "none",
                    outline: "1px solid black",
                    marginTop: "10px",
                  }}
                >
                  ReStock Products
                </Button>
              </form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Body style={{ textAlign: "center" }}>
              <h1>Cart</h1>
              <h3>Cart Items:</h3>
              <Accordion defaultActiveKey="0">{cartList}</Accordion>
              <br />
              <h3>Check Out:</h3>
              <h5 className="total">Cart Total: $ {finalList().total}</h5>
              <div>{finalList().total > 0 && finalList().final}</div>
              <Button
                onClick={() => {
                  if (cart.length > 0) {
                    alert(`Your order has been processed`);
                    setCart([]);
                  }
                }}
                style={{
                  backgroundColor: "#444444",
                  border: "none",
                  outline: "1px solid black",
                }}
              >
                Checkout
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <h1>Product List</h1>
          <div className="product-list">{cardList}</div>
        </Col>
      </Row>
    </Container>
  );
};

ReactDOM.render(
  <React.Fragment>
    <Products />
  </React.Fragment>,
  document.getElementById("root")
);
