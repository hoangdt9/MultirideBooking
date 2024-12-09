import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { IVoucher, IVoucherDocs } from '~/types'

export const VoucherApi = createApi({
  reducerPath: 'voucherApi',

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const accessToken = localStorage.getItem('token')

      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`)
      }
      return headers
    }
  }),
  tagTypes: ['Vouchers'],
  endpoints: (builder) => ({
    /* Phần get voucher */
    getAllVouchers: builder.query<IVoucherDocs, { page: number; limit: number }>({
      query: ({ page, limit }) => {
        return `/promotions?page=${page}&limit=${limit}`
      },
      providesTags: (result) => [{ type: 'Vouchers', id: 'LIST' }]
    }),

    getAllVouchersActive: builder.query<IVoucherDocs, number | string>({
      query: () => `/vouchers/active`,
      providesTags: (result) => {
        if (result) {
          const final = [
            ...result.data.docs.map(({ _id }) => ({ type: 'Vouchers' as const, _id })),
            { type: 'Vouchers' as const, id: 'LIST' }
          ]
          return final
        }
        return [{ type: 'Vouchers', id: 'LIST' }]
      }
    }),

    addVoucher: builder.mutation<IVoucher, IVoucher>({
      query: (voucher: IVoucher) => ({
        url: '/promotions',
        method: 'POST',
        body: voucher
      }),
      invalidatesTags: ['Vouchers']
    }),

    deleteVoucher: builder.mutation<IVoucher, { id: string | number }>({
      query: ({ id }) => ({
        url: `/promotions/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Vouchers']
    }),

    updateVoucher: builder.mutation<IVoucher, Partial<IVoucher>>({
      query(data) {
        const { _id, ...body } = data
        return {
          url: `/promotions/${_id}`,
          method: 'PUT',
          body
        }
      },
      // Invalidates all queries that subscribe to this Post `id` only.
      // In this case, `getPost` will be re-run. `getPosts` *might*  rerun, if this id was under its results.
      invalidatesTags: (_, __, { _id }) => [{ type: 'Vouchers', _id }]
    })
  })
})

export const {
  useGetAllVouchersQuery,
  useGetAllVouchersActiveQuery,
  useAddVoucherMutation,
  useDeleteVoucherMutation,
  useUpdateVoucherMutation
} = VoucherApi
