import axios from "axios";
import { API_BASE_URL, API_URLS } from "../constant";

export const getAllShipping = async ()=>{
    let url = API_BASE_URL + API_URLS.GET_SHIP;

    try{
        const result = await axios(url, {
            method: "GET",
        });
        return result?.data;
    }
    catch(err){
        console.log(err);
    }
}