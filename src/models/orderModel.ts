// src/models/orderModel.ts
import type { CreateOrderRequest, OrderItemRequest } from '@/types/Order/order'

const STORAGE_KEY = 'mh_order_model'

class OrderModel {
    private shipId: string | null = null
    private orderItems: OrderItemRequest[] = []

    constructor() {
        this.load()
    }

    setShipId(id: string) {
        this.shipId = id
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
        if (!this.shipId || this.orderItems.length === 0) return null
        return {
            shipId: this.shipId,
            orderItems: this.orderItems.map(i => ({ ...i }))
        }
    }

    private save() {
        try {
            const payload = { shipId: this.shipId, orderItems: this.orderItems }
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
            this.shipId = parsed?.shipId ?? null
            this.orderItems = Array.isArray(parsed?.orderItems) ? parsed.orderItems : []
        } catch (e) {
            // ignore
        }
    }
}

const orderModel = new OrderModel()
export default orderModel
