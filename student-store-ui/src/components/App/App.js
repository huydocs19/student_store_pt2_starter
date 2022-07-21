import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import apiClient from "../../services/apiClient"
import Home from "../Home/Home"
import Signup from "../Signup/Signup"
import Login from "../Login/Login"
import Orders from "../Orders/Orders"
import NotFound from "../NotFound/NotFound"
import ShoppingCart from "../ShoppingCart/ShoppingCart"
import { removeFromCart, addToCart, getQuantityOfItemInCart, getTotalItemsInCart } from "../../utils/cart"
import "./App.css"

export default function App() {
  const [activeCategory, setActiveCategory] = useState("All Categories")
  const [searchInputValue, setSearchInputValue] = useState("")
  const [user, setUser] = useState({})
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [cart, setCart] = useState({})
  const [isFetching, setIsFetching] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [error, setError] = useState(null)

  const handleOnRemoveFromCart = (item) => setCart(removeFromCart(cart, item))
  const handleOnAddToCart = (item) => setCart(addToCart(cart, item))
  const handleGetItemQuantity = (item) => getQuantityOfItemInCart(cart, item)
  const handleGetTotalCartItems = () => getTotalItemsInCart(cart)

  const handleOnSearchInputChange = (event) => {
    setSearchInputValue(event.target.value)
  }

  const handleOnCheckout = async () => {
    setIsCheckingOut(true)

    const {data, error} = await apiClient.createOrder({ order: cart })
    if (error) {
      setError(error)
    }
    console.log(data)
    if (data?.order) {
      setOrders((o) => [...data.order, ...o])
      setIsCheckingOut(false)
      setCart({})
      return data.order    
    } else {
      setError("Error checking out.")
    }
    setIsCheckingOut(false)    
  }

  useEffect(() => {
    const fetchProducts = async () => {
      setIsFetching(true)

      const {data, error} = await apiClient.fetchProductList()      
      if (error) {
        setError(error)
      }
      if (data?.products) {
        setProducts(data.products)        
      } else {
        setError("Error fetching products.")
      }
      setIsFetching(false)
    }

    fetchProducts()
  }, [])
  useEffect(() => {
    const fetchAuthedUser = async () => {
      setIsFetching(true)
      
      const {data, error} = await apiClient.fetchUserFromToken()      
      if (error) {
        setError(error)
      }
      if (data?.user) {
        setUser(data.user)        
      } else {
        setError("Error fetching user.")
      }      
      setIsFetching(false)
    }

    const token = localStorage.getItem(apiClient.getTokenKey())    
    if (token) {
      apiClient.setToken(token)
      fetchAuthedUser()
    }
    
  }, [])
  const handleLogout = async () => {
    console.log("logout")
    await apiClient.logOutUser()
    setUser(null)
    setOrders([])
    setError(null)
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                user={user}
                error={error}
                products={products}
                isFetching={isFetching}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                searchInputValue={searchInputValue}
                handleOnSearchInputChange={handleOnSearchInputChange}
                addToCart={handleOnAddToCart}
                removeFromCart={handleOnRemoveFromCart}
                getQuantityOfItemInCart={handleGetItemQuantity}
                handleLogout={handleLogout}
              />
            }
          />
          <Route path="/login" element={<Login user={user} setUser={setUser} />} />
          <Route path="/signup" element={<Signup user={user} setUser={setUser} />} />
          <Route
            path="/orders"
            element={
              <Orders
                user={user}
                error={error}
                orders={orders}
                setUser={setUser}
                products={products}
                isFetching={isFetching}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                searchInputValue={searchInputValue}
                handleOnSearchInputChange={handleOnSearchInputChange}
                handleLogout={handleLogout}
              />
            }
          />
          <Route
            path="/shopping-cart"
            element={
              <ShoppingCart
                user={user}
                cart={cart}
                error={error}
                setUser={setUser}
                products={products}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                searchInputValue={searchInputValue}
                handleOnSearchInputChange={handleOnSearchInputChange}
                addToCart={handleOnAddToCart}
                removeFromCart={handleOnRemoveFromCart}
                getQuantityOfItemInCart={handleGetItemQuantity}
                getTotalItemsInCart={handleGetTotalCartItems}
                isCheckingOut={isCheckingOut}
                handleOnCheckout={handleOnCheckout}
                handleLogout={handleLogout}
              />
            }
          />
          <Route
            path="*"
            element={
              <NotFound
                user={user}
                error={error}
                products={products}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                searchInputValue={searchInputValue}
                handleOnSearchInputChange={handleOnSearchInputChange}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
