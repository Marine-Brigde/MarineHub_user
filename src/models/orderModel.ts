// src/models/orderModel.ts
import type { CreateOrderRequest, OrderItemRequest } from '@/types/Order/order'

const STORAGE_KEY = 'mh_order_model'

class OrderModel {
    private shipId: string | null = null
    private orderItems: OrderItemRequest[] = []

    constructor() {
        this.load()
    }

    setShipId(id?: string | null) {
        this.shipId = id ?? null
        this.save()
    }

    getShipId() {
        return this.shipId
    }

    addItem(item: OrderItemRequest) {
        // if same productVariantId exists, increment quantity
        const existing = this.orderItems.find(i => i.productVariantId === item.productVariantId && i.productOptionName === item.productOptionName)
        if (existing) {
            existing.quantity += item.quantity
        } else {
            this.orderItems.push({ ...item })
        }
        this.save()
    }

    updateItem(productVariantId: string, quantity: number) {
        const idx = this.orderItems.findIndex(i => i.productVariantId === productVariantId)
        if (idx >= 0) {
            if (quantity <= 0) this.orderItems.splice(idx, 1)
            else this.orderItems[idx].quantity = quantity
            this.save()
        }
    }

    removeItem(productVariantId: string) {
        this.orderItems = this.orderItems.filter(i => i.productVariantId !== productVariantId)
        this.save()
    }

    getItems() {
        return [...this.orderItems]
    }

    clear() {
        this.shipId = null
        this.orderItems = []
        this.save()
    }

    buildCreateOrderRequest(): CreateOrderRequest | null {
        const validItems = this.orderItems.filter(i => typeof i.quantity === 'number' && i.quantity > 0)
        if (validItems.length === 0) return null
        const req: CreateOrderRequest = {
            orderItems: validItems.map(i => ({ ...i })),
        }
        return req
    }

    private save() {
        try {
            const payload = { orderItems: this.orderItems }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
        } catch (e) {
            // ignore
        }
    }

    private load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (!raw) return
            const parsed = JSON.parse(raw)
            this.orderItems = Array.isArray(parsed?.orderItems) ? parsed.orderItems : []
        } catch (e) {
            // ignore
        }
    }
}

const orderModel = new OrderModel()
export default orderModel
