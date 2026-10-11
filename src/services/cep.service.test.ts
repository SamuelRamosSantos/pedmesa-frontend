import { afterEach, describe, expect, it, vi } from "vitest";
import { criarBuscadorCep } from "./cep.service";

const PAULISTA = { logradouro: "Avenida Paulista", bairro: "Bela Vista", localidade: "São Paulo", uf: "SP" };

function respostaJson(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });
}

// fetch que só termina quando é cancelado (simula o ViaCEP fora do ar).
function fetchQueNuncaResponde(): typeof fetch {
  return (_entrada, init) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Cancelado", "AbortError")));
    });
}

afterEach(() => {
  vi.useRealTimers();
});

describe("criarBuscadorCep", () => {
  it("consulta o ViaCEP só com os dígitos, sem credenciais nem referrer", async () => {
    const fetchFalso = vi.fn<typeof fetch>().mockResolvedValue(respostaJson(PAULISTA));
    const buscar = criarBuscadorCep({ fetch: fetchFalso });

    await expect(buscar("01310-100")).resolves.toEqual({
      logradouro: "Avenida Paulista",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "SP",
    });
    expect(fetchFalso).toHaveBeenCalledWith(
      "https://viacep.com.br/ws/01310100/json/",
      expect.objectContaining({ credentials: "omit", referrerPolicy: "no-referrer" })
    );
    const [, init] = fetchFalso.mock.calls[0];
    expect(init?.headers).toBeUndefined();
  });

  it.each([[""], ["0131"], ["0131010"], ["013101001"]])("não consulta sem 8 dígitos (%s)", async (cep) => {
    const fetchFalso = vi.fn<typeof fetch>();
    await expect(criarBuscadorCep({ fetch: fetchFalso })(cep)).resolves.toBeNull();
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("guarda em cache por CEP, inclusive CEP inexistente", async () => {
    const fetchFalso = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(respostaJson(PAULISTA))
      .mockResolvedValueOnce(respostaJson({ erro: true }));
    const buscar = criarBuscadorCep({ fetch: fetchFalso });

    await buscar("01310100");
    await buscar("01310-100");
    await expect(buscar("99999999")).resolves.toBeNull();
    await expect(buscar("99999999")).resolves.toBeNull();

    expect(fetchFalso).toHaveBeenCalledTimes(2);
  });

  it("erro HTTP falha e não entra no cache", async () => {
    const fetchFalso = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(respostaJson({}, 500))
      .mockResolvedValueOnce(respostaJson(PAULISTA));
    const buscar = criarBuscadorCep({ fetch: fetchFalso });

    await expect(buscar("01310100")).rejects.toThrow("500");
    await expect(buscar("01310100")).resolves.not.toBeNull();
    expect(fetchFalso).toHaveBeenCalledTimes(2);
  });

  it("desiste depois do timeout", async () => {
    vi.useFakeTimers();
    const buscar = criarBuscadorCep({ fetch: fetchQueNuncaResponde(), timeoutMs: 3000 });

    const busca = buscar("01310100");
    const verificacao = expect(busca).rejects.toThrow("Cancelado");
    await vi.advanceTimersByTimeAsync(3000);

    await verificacao;
  });

  it("cancela quando quem chamou cancela", async () => {
    const controller = new AbortController();
    const busca = criarBuscadorCep({ fetch: fetchQueNuncaResponde() })("01310100", controller.signal);

    controller.abort();

    await expect(busca).rejects.toThrow("Cancelado");
  });
});
