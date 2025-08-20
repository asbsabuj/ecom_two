import { getAllCategories } from "@/lib/acions/product.action"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Drawer,
  DrawerTrigger,
  DrawerHeader,
  DrawerContent,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer"
import { MenuIcon } from "lucide-react"

const CategoryDrawer = async () => {
  const categories = await getAllCategories()

  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline">
          <MenuIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full max-w-sm">
        <DrawerHeader>
          <DrawerTitle>Select a category</DrawerTitle>
          <div className="space-y-1 mt-4">
            {categories.map((c) => (
              <Button
                asChild
                variant="ghost"
                key={c.category}
                className="w-full justify-start"
              >
                <DrawerClose asChild>
                  <Link href={`/search?query=${c.category}`}>
                    {c.category} ({c._count})
                  </Link>
                </DrawerClose>
              </Button>
            ))}
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  )
}

export default CategoryDrawer
