import { createSlice } from "@reduxjs/toolkit"
export const initialState = {
  userInfo: null,
  orders: [],
  usersList: [],
};

export const userSlice = createSlice({
    name:'userSlice',
    initialState,
    reducers:{
        loadUserInfo : (state,action)=>{
            return {
                ...state,
                userInfo:action?.payload
            }
        },
        saveAddress : (state,action)=>{
            const addresses = [...state?.userInfo?.addressList] ?? [];
            addresses.push(action?.payload);
            // return {
            //     ...state,
            //     userInfo:{
            //         ...state?.userInfo,
            //         addressList:addresses
            //     }
            // }

            state.userInfo.addressList = addresses;
        },
        updateAddress: (state, action) => {
            const updatedAddress = action.payload;
            const updatedList = state?.userInfo?.addressList?.map((addr) =>
                addr.id === updatedAddress.id ? updatedAddress : addr
            );
            return {
                ...state,
                userInfo: {
                    ...state.userInfo,
                    addressList: updatedList,
                },
            };
        },
        removeAddress:(state,action)=>{
            return {
                ...state,
                userInfo:{
                    ...state?.userInfo,
                    addressList: state?.userInfo?.addressList?.filter(address=> address?.id !== action?.payload)
                }
            }
        },
        loadOrders: (state,action)=>{
            return {
                ...state,
                orders:action?.payload
            }
        },
        cancelOrder: (state,action)=>{
            return {
                ...state,
                orders:state?.orders?.map(order=>{
                    if(order?.id === action?.payload){
                        return {
                            ...order,
                            orderStatus:'CANCELLED'
                        }
                    }
                    return order;
                })
            }
        },
        clearUserInfo: (state) => {
            state.userInfo = null;
            state.orders = [];
        },

        loadUsersList: (state, action) => {
            state.usersList = action.payload;
        },

        updateUserStatusInList: (state, action) => {
            const { id, enabled } = action.payload;
            const user = state.usersList.find(u => u.id === id);
            if (user) {
                user.enabled = enabled;
            }
        },
        removeUserFromList: (state, action) => {
            const idToDelete = action.payload;
            state.usersList = state.usersList.filter(user => user.id !== idToDelete);
        },

        updateUserInList: (state, action) => {
            const updatedUser = action.payload;
            const index = state.usersList.findIndex(u => u.id === updatedUser.id);
            if (index !== -1) {
                state.usersList[index] = { ...state.usersList[index], ...updatedUser };
            }
        },
    }
});

export const { loadUserInfo, saveAddress, removeAddress, loadOrders, cancelOrder, updateAddress, clearUserInfo, loadUsersList, updateUserStatusInList, removeUserFromList, updateUserInList } = userSlice?.actions;

export const selectUserInfo = (state) => state?.userState?.userInfo ?? {};
export const selectAllOrders = (state) => state?.userState?.orders ?? [];
export const selectUsersList = (state) => state?.userState?.usersList ?? [];

export default userSlice?.reducer;