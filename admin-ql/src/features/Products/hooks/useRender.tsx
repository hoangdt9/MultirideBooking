import { AiFillEdit, AiOutlineUndo } from 'react-icons/ai'
import { Button as ButtonAntd, Input, InputRef, Popconfirm, Space, Tag, Tooltip, message } from 'antd'
import { IProduct, IRoleUser, ISizeRefProduct, IToppingRefProduct } from '~/types'
import { RootState, useAppDispatch } from '~/store/store'
import { setOpenDrawer, setProductDetail, setProductId } from '~/store/slices'
import {
  useDeleteFakeProductMutation,
  useDeleteProductMutation,
  useEditProductMutation,
  useRestoreProductMutation
} from '~/store/services'
import { useRef, useState } from 'react'

import type { ColumnType } from 'antd/es/table'
import { DeleteIcon, Loading } from '~/components'
import { FilterConfirmProps } from 'antd/es/table/interface'
import Highlighter from 'react-highlight-words'
import { ICategoryRefProduct } from '~/types/Category'
import { SearchOutlined, SyncOutlined } from '@ant-design/icons'
import { TbBasketDiscount } from 'react-icons/tb'
import clsxm from '~/utils/clsxm'
import { formatCurrency } from '~/utils'
import { useAppSelector } from '~/store/hooks'
export const useRender = (productsList: IProduct[], deleteReal?: boolean, checkPath?: boolean) => {
  const dispatch = useAppDispatch()
  const searchInput = useRef<InputRef>(null)
  const [searchText, setSearchText] = useState<string>('')
  const [searchedColumn, setSearchedColumn] = useState<string>('')
  const [options, setOptions] = useState({ page: 1, limit: 10 })
  const [deleteFakeProduct] = useDeleteFakeProductMutation()
  const [restoreProduct] = useRestoreProductMutation()
  const [deleteProduct] = useDeleteProductMutation()
  const [changeStatusProduct, { isLoading: isChangeStatus }] = useEditProductMutation()

  const { user } = useAppSelector((state: RootState) => state.persistedReducer.auth)

  const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void, dataIndex: IProduct) => {
    confirm()
    setSearchText(selectedKeys[0])
    setSearchedColumn(dataIndex.name)
  }

  const getColumnSearchProps = (dataIndex: IProduct): ColumnType<IProduct> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
      <div style={{ padding: 8, width: '100%' }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          size='large'
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <ButtonAntd
            type='primary'
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size='large'
          >
            Tìm kiếm Xe
          </ButtonAntd>
        </Space>
      </div>
    ),
    filterIcon: () => (
      <Tooltip title='Tìm kiếm Xe'>
        <ButtonAntd type='primary' shape='circle' icon={<SearchOutlined />} />
      </Tooltip>
    ),
    onFilter: (value: any, record: any) => {
      console.log(value, 'valuevalue')
      console.log(record, 'record')
      return record[dataIndex as unknown as number]?.toString().toLowerCase().includes(value.toLowerCase())
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100)
      }
    },
    render: (text, product: IProduct) =>
      searchedColumn === dataIndex.name ? (
        <div className='gap-x-3 flex items-center justify-start'>
          <img
            onClick={() => {
              dispatch(setOpenDrawer(true))
              dispatch(setProductDetail(product))
            }}
            src={'/bus-bg.jpg'}
            alt={'/bus-bg.jpg'}
            className='object-cover w-20 h-20 rounded-lg cursor-pointer'
          />
          <div className='flex flex-col gap-0.5 justify-center items-start'>
            <Tag
              color={clsxm(
                { success: !product.is_deleted && product.is_active },
                { '#333': product.is_deleted },
                { red: !product.is_deleted && !product.is_active }
              )}
            >
              {product.busTypeName}
            </Tag>
            <p
              onClick={() => {
                dispatch(setOpenDrawer(true))
                dispatch(setProductDetail(product))
              }}
              className='hover:underline capitalize truncate cursor-pointer w-[215px]'
            >
              {/* {product.name} */}
              <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text ? text.toString() : ''}
              />
            </p>
            {product.sale > 0 && (
              <p className='flex items-center justify-center gap-1'>
                <span>
                  <TbBasketDiscount />
                </span>
                <span className=''>{formatCurrency(product.sale)}</span>
              </p>
            )}
          </div>
        </div>
      ) : (
        // text
        <div className='gap-x-3 flex items-center justify-start'>
          <img
            onClick={() => {
              dispatch(setOpenDrawer(true))
              dispatch(setProductDetail(product))
            }}
            src={'/bus-bg.jpg'}
            alt={'/bus-bg.jpg'}
            className='object-cover w-20 h-20 rounded-lg cursor-pointer'
          />
          <div className='flex flex-col gap-0.5 justify-center items-start'>
            <Tag
              color={clsxm(
                { '#333': !product.is_deleted && product.is_active },
                { '#333': product.is_deleted },
                { '#333': !product.is_deleted && !product.is_active }
              )}
            >
              {product.busTypeName}
            </Tag>
            <p
              onClick={() => {
                dispatch(setOpenDrawer(true))
                dispatch(setProductDetail(product))
              }}
              className='hover:underline capitalize truncate cursor-pointer w-[215px]'
            >
              {product.name}
            </p>
            {product.sale > 0 && (
              <p className='flex items-center justify-center gap-1'>
                <span>
                  <TbBasketDiscount />
                </span>
                <span className=''>{formatCurrency(product.sale)}</span>
              </p>
            )}
          </div>
        </div>
      )
  })
  /* columns staff */
  const columnsStaff: any = [
    {
      title: 'Số thứ tự',
      dataIndex: 'index',
      key: 'index',
      width: 50
    },
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      render: (_: any, record: IProduct, index: number) => {
        // Tính số thứ tự dựa trên trang và giới hạn
        const startIndex = (options.page - 1) * options.limit
        return startIndex + index + 1 // index là chỉ số của bản ghi trong trang
      }
    },
    {
      title: 'Biển số xe',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
      filterSearch: true,
      filters: productsList?.map((item: any) => ({ text: item.licensePlate, value: item.licensePlate })),
      onFilter: (value: any, record: any) => record.licensePlate === value,
      render: (category: ICategoryRefProduct) => <p className='capitalize'>{category}</p>
    },
    {
      title: 'Loại xe ',
      dataIndex: 'busTypeName',
      key: 'busTypeName',
      width: 180,
      render: (sizes: ISizeRefProduct[]) => (
        <>
          <p className=''>{sizes}</p>
        </>
      )
    },
    {
      title: 'Số lượng Ghế  ',
      dataIndex: 'seatCapacity',
      key: 'seatCapacity',
      render: (sizes: ISizeRefProduct[]) => (
        <>
          <p className=''>{sizes} ghế</p>
        </>
      )
    },
    {
      title: 'Hệ số giá',
      dataIndex: 'priceFactor',
      key: 'priceFactor',
      render: (seatCapacity: any) => {
        return (
          <>
            <p className=''>{seatCapacity}</p>
          </>
        )
      }
    },
    {
      title: 'Trạng thái ',
      dataIndex: 'status', // Nhận dữ liệu từ trường nào trong database
      key: 'status',
      render: (seatCapacity: any) => {
        return (
          <>
            <Tag color={seatCapacity == 'OPEN' ? 'green' : 'error'} className=''>
              {seatCapacity == 'OPEN' ? 'Hoạt động' : 'Ngừng hoạt động'}
            </Tag>{' '}
          </>
        )
      }
    }
  ]

  const handleRestoreProduct = async (id: string) => {
    try {
      const response = await restoreProduct({ id })
      if ((response as any).message === 'success') {
        message.success('Khôi phục Xe thành công!')
      }
    } catch (error) {
      message.error('Khôi phục Xe thất bại')
    }
  }

  const handleDeleteProductReal = async (id: string) => {
    try {
      const response = await deleteProduct({ id })
      if ((response as any).message === 'success') {
        message.success('Xóa Xe thành công!')
      }
    } catch (error) {
      message.error('Khôi phục Xe thất bại')
    }
  }

  const columnsAdmin: any = [
    ...columnsStaff,
    {
      // title: 'Action',
      dataIndex: 'action',
      width: 100,
      key: 'action',
      render: (_: any, product: IProduct) => {
        if (!deleteReal && !checkPath) {
          return (
            <Space>
              {isChangeStatus && <Loading overlay />}
              <Tooltip title='Cập nhật Xe'>
                <ButtonAntd
                  size='large'
                  icon={<AiFillEdit />}
                  onClick={() => {
                    dispatch(setOpenDrawer(true))
                    dispatch(setProductId(product._id))
                  }}
                  className='bg-primary hover:text-white flex items-center justify-center text-white'
                />
              </Tooltip>
            </Space>
          )
        } else {
          return (
            <>
              {!checkPath && (
                <Space>
                  <Tooltip title='Khôi phục Xe'>
                    <Popconfirm
                      title='Bạn có muốn khôi phục Xe này?'
                      onConfirm={() => handleRestoreProduct(product._id)}
                      okText='Đồng ý'
                      cancelText='Hủy'
                    >
                      <ButtonAntd
                        size='large'
                        icon={<AiOutlineUndo />}
                        className='bg-primary hover:text-white flex items-center justify-center text-white'
                      />
                    </Popconfirm>
                  </Tooltip>
                  <Popconfirm
                    title='Xóa Xe?'
                    onConfirm={() => handleDeleteProductReal(product._id)}
                    okText='Đồng ý'
                    cancelText='Hủy'
                  >
                    <ButtonAntd
                      size='large'
                      icon={<DeleteIcon />}
                      danger
                      className='hover:text-white flex items-center justify-center text-white'
                    />
                  </Popconfirm>
                </Space>
              )}
            </>
          )
        }
      }
    }
  ]

  // return user && user.role === IRoleUser.ADMIN ? columnsAdmin : columnsStaff
  return columnsAdmin
}
