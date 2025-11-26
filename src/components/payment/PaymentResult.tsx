"use client"

import React, { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

function parseQuery() {
    try {
        return new URLSearchParams(window.location.search)
    } catch {
        return new URLSearchParams()
    }
}

export default function PaymentResult() {
    const [visible, setVisible] = useState(false)
    const [kind, setKind] = useState<'success' | 'error' | 'info'>('info')
    const [title, setTitle] = useState<string>('')
    const [desc, setDesc] = useState<string>('')

    useEffect(() => {
        const qs = parseQuery()
        // support multiple param names used by payment providers
        const status = (qs.get('status') || qs.get('payment_status') || qs.get('paymentStatus') || qs.get('result') || '').toLowerCase()
        const message = qs.get('message') || qs.get('msg') || ''
        const orderCode = qs.get('orderCode') || qs.get('order_code') || qs.get('order') || ''

        if (!status) return

        if (['success', 'paid', 'completed', 'ok'].includes(status)) {
            setKind('success')
            setTitle('Thanh toán thành công')
            setDesc(message || (orderCode ? `Đơn hàng ${orderCode} đã được thanh toán.` : 'Giao dịch đã hoàn tất.'))
            setVisible(true)
            return
        }

        if (['pending'].includes(status)) {
            setKind('info')
            setTitle('Thanh toán đang chờ')
            setDesc(message || (orderCode ? `Đơn hàng ${orderCode} đang chờ xử lý.` : 'Giao dịch đang chờ xử lý.'))
            setVisible(true)
            return
        }

        // error / failed
        setKind('error')
        setTitle('Thanh toán thất bại')
        setDesc(message || 'Giao dịch không thành công. Vui lòng thử lại.')
        setVisible(true)
    }, [])

    const handleClose = () => {
        setVisible(false)
        // remove payment-related query params from URL without reloading
        try {
            const url = new URL(window.location.href)
            const qs = url.searchParams
                ;['status', 'payment_status', 'paymentStatus', 'result', 'message', 'msg', 'orderCode', 'order_code', 'order'].forEach(k => qs.delete(k))
            url.search = qs.toString()
            window.history.replaceState({}, document.title, url.toString())
        } catch (e) {
            // ignore
        }
    }

    if (!visible) return null

    return (
        <div className="max-w-3xl mx-auto mt-4">
            <Alert variant={kind === 'error' ? 'destructive' : 'default'}>
                <div className="flex items-start justify-between">
                    <div>
                        <AlertTitle>{title}</AlertTitle>
                        <AlertDescription>{desc}</AlertDescription>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <Button variant={kind === 'error' ? 'destructive' : 'outline'} onClick={handleClose}>Đóng</Button>
                    </div>
                </div>
            </Alert>
        </div>
    )
}
