import { expect, test } from "@playwright/test";

test("registra uma despesa e mantém o lançamento após recarregar", async ({ page }) => {
  const description = `Compra E2E ${Date.now()}`;

  await page.goto("/");
  await expect(page.getByText("Clarior").first()).toBeVisible();
  await page.getByRole("button", { name: "Nova transação" }).first().click();

  await page.getByLabel("Descrição").fill(description);
  await page.getByLabel("Valor").fill("25,90");
  await page.getByLabel("Categoria").selectOption("Alimentação");
  await page.getByRole("button", { name: "Salvar transação" }).click();

  await expect(page.getByText(description)).toBeVisible();
  await page.reload();
  await expect(page.getByText(description)).toBeVisible();
});
