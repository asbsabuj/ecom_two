import { useState } from "react"
import { signUpDefaultValues } from "@/lib/constants"
import Image from "next/image"

function PasswordField() {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  return (
    <div className="relative">
      <label htmlFor="password">password</label>
      <input
        id="password"
        name="password"
        autoComplete="password"
        required
        defaultValue={signUpDefaultValues.password}
        type={isVisible ? "text" : "password"}
        //className="w-full text-sm text-gray-700 bg-white border border-gray-300 appearance-none rounded-lg ps-3.5 pe-10 py-2.5 outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        placeholder="Enter your password..."
      />
      <button
        className="absolute py-11 pr-5 inset-y-0 right-0 flex items-center px-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        onClick={toggleVisibility}
      >
        {isVisible ? (
          <Image
            src="/images/show.png"
            alt="show icon"
            width={20}
            height={20}
          />
        ) : (
          <Image
            src="/images/hide.png"
            alt="hide icon"
            width={20}
            height={20}
          />
        )}
      </button>
    </div>
  )
}

export default PasswordField
