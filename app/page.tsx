import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-background2">
      <main className="p-8 flex flex-col">
        <h1 className="text-4xl font-bold mb-4">Place your order!</h1>
        <hr className="mb-4" />
        <form className="flex flex-col gap-4">
          <div className="relative">
            <input type="text" id="name" className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer" placeholder=" " />
            <label htmlFor="name" className="absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-background2 px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Imię i nazwisko</label>
          </div>
          <div className="relative">
            <input type="text" id="amount" className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer" placeholder=" " />
            <label htmlFor="amount" className="absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-background2 px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Ilość</label>
          </div>
          <div className="relative">
            <input type="text" id="name" className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer" placeholder=" " />
            <label htmlFor="name" className="absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-background2 px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Imię i nazwisko</label>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-secondary text-foreground rounded hover:bg-primary-dark transition-colors"
          >
            Place Order
          </button>
        </form>
      </main>
    </div>
  );
}
