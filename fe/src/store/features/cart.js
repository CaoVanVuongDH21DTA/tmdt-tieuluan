import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    appliedDiscount: JSON.parse(localStorage.getItem("appliedDiscount")) || null,
}

const cartSlice = createSlice({
    name: 'cartState',
    initialState: initialState,
    reducers: {

        //cart
        addToCart: (state, action) => {
            const { productId, variant, quantity, price } = action.payload;
            const existingItem = state.cart.find(
                (item) =>
                item.productId === productId &&
                (item.variant?.id || null) === (variant?.id || null)
            );

            if (existingItem) {
                existingItem.quantity += quantity || 1;
                existingItem.subTotal = existingItem.quantity * existingItem.price;
            } else {
                const qty = quantity || 1;
                state.cart.push({
                ...action.payload,
                quantity: qty,
                subTotal: qty * price,
                });
            }
            localStorage.setItem("cart", JSON.stringify(state.cart));
        },

        updateQuantity: (state, action) => {
            const { productId, variant_id, quantity } = action.payload;
            const item = state.cart.find(
                (item) =>
                item.productId === productId &&
                (item.variant?.id || null) === (variant_id || null)
            );

            if (item) {
                item.quantity = quantity;
                item.subTotal = quantity * item.price;
                localStorage.setItem("cart", JSON.stringify(state.cart));
            }
        },

        removeFromCart: (state, action) => {
            state.cart = state.cart.filter(
                (item) =>
                !(
                    item.productId === action.payload.productId &&
                    (item.variant?.id || null) === (action.payload.variantId || null) 
                )
            );
            localStorage.setItem("cart", JSON.stringify(state.cart));
        },

        deleteCart: (state) => {
            state.cart = [];
            localStorage.removeItem('cart');
        },

        clearCart: (state) => {
            state.cart = [];
            state.appliedDiscount = null;
            localStorage.removeItem('cart');
            localStorage.removeItem('appliedDiscount');
        },

        applyDiscount: (state, action) => {
            state.appliedDiscount = action.payload;
            localStorage.setItem("appliedDiscount", JSON.stringify(state.appliedDiscount));
        },
    }
})

export const { 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    deleteCart, 
    clearCart, 
    applyDiscount, 
} = cartSlice.actions;

// Selectors
export const countCartItems = (state) => state.cartState?.cart?.length || 0;

export const selectCartItems = (state) => state.cartState?.cart || [];

export const selectCartTotal = (state) => 
    state.cartState.cart.reduce((total, item) => total + (item.subTotal || 0), 0);

export const selectTotalQuantity = (state) => 
    state.cartState.cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

export const selectAppliedDiscount = (state) => state.cartState.appliedDiscount;

export default cartSlice.reducer;