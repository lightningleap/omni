import ProductCreatorClient from "@/components/admin/ProductCreatorClient"
import { ADMIN_SHELL } from "@/components/admin/ui/primitives"

export default function NewProductPage() {
  return (
    <div className={ADMIN_SHELL}>
      <ProductCreatorClient />
    </div>
  )
}
