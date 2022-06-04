import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // Busca o produto na API baseado no Id
      const { data: product } = await api.get<Product>(
        `/products/${productId}`
      );

      // Busca a quantidade em estoque do produto na API baseado no Id do Produto
      const { data: stock } = await api.get<Stock>(`/stock/${productId}`);

      if (!product.id) return;

      // Verifica se o carrinho já contém o produto
      const productExistent = cart.find((item) => product.id === item.id);

      // Atualiza a quantidade do produto existente no carrinho
      // se não, adiciona ele no carrinho
      const updateProduct: Product = productExistent
        ? { ...productExistent, amount: productExistent.amount + 1 }
        : { ...product, amount: 1 };

      // Verifica se a quantidade de estoque for menor que a de compra
      if (stock.amount < updateProduct.amount) {
        throw new Error("Quantidade solicitada fora de estoque");
      }

      // Se o produto já existir no carrinho, ele atualiza os dados do produto
      // Se não, adiciona o produto no carrinho
      const updatedCart = cart.map((itemCart) => {
        if (itemCart.id === productId) return updateProduct;
        return itemCart;
      });

      // Atualiza o carrinho e salva no local storage
      setCart(updatedCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
    } catch (ex) {
      if (ex instanceof Error) toast.error(ex.message);

      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
