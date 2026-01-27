import { addToCart, deleteCart, removeFromCart, updateQuantity } from "../features/cart"; 

const updateLocalStorage = (getState) => {
  const fullState = getState();
  const { cartState } = fullState; 
  if (cartState && cartState.cart) {
    localStorage.setItem('cart', JSON.stringify(cartState.cart));
  }
};

// --- ACTION CREATORS ---
export const addItemToCartAction = (productItem) => {
  return (dispatch, getState) => {
    dispatch(addToCart(productItem));
    updateLocalStorage(getState);
  };
};

export const updateItemToCartAction = (productItem) => {
  return (dispatch, getState) => {
    dispatch(updateQuantity({
      productId: productItem?.productId,
      variant_id: productItem?.variant_id,
      quantity: productItem?.quantity
    }));
    
    updateLocalStorage(getState);
  };
};

export const deleteItemFromCartAction = (payload) => {
  return (dispatch, getState) => { 
    dispatch(removeFromCart(payload));
    
    updateLocalStorage(getState);
  };
};

export const clearCartAction = () => { 
  return (dispatch) => {
    dispatch(deleteCart());
    localStorage.removeItem('cart'); 
    localStorage.removeItem('appliedDiscount'); 
  };
};