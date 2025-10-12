import { ProductAdd } from "@/pages/admin/products/types";
import axiosCustomize from "@/services/axios.customize";
import { ApiResponse, ParamRequest } from "@/types/request";

export const fetchProductsAPIs = async (
    params: ParamRequest
): Promise<ApiResponse<Product[]>> => {
    const res = await axiosCustomize.get<ApiResponse<Product[]>>("/spus", {
        params,
    });
    return res.data;
};

export const fetchProductsAPIsByCategory = async (
    categoryId: string,
    params: ParamRequest
): Promise<ApiResponse<Product[]>> => {
    const res = await axiosCustomize.get<ApiResponse<Product[]>>("/spus/category/" + categoryId, {
        params,
    });
    return res.data;
};

export const fetchProductBySlug = async (slug: string) => {
    return await axiosCustomize.get<Product>("/spus/" + slug);
}

export const createNewProductAPIs = async (data: ProductAdd) => {
    return await axiosCustomize.post("/spus", data);
}

export const deleteProductAPIs = async (id: string) => {
    return await axiosCustomize.delete(`/spus/${id}`)
}

export const updateProductAPIs = async (id: string, data: any) => {
    return await axiosCustomize.put(`/spus/${id}`, data)
}

export const fetchRelatedProducts = async (slug: string, limit = 4) => {
    return await axiosCustomize.get(`/spus/related/${slug}?limit=${limit}`)
}