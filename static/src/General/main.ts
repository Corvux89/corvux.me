export function ToastError(message: string): void{
    $("#error-toast .toast-body").html(message)
    $("#error-toast").toast("show")
}

export function ToastSuccess(message: string): void{
    $("#confirm-toast .toast-body").html(message)
    $("#confirm-toast").toast("show")
}