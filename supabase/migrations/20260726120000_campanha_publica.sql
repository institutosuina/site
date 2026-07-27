-- Versão web das campanhas de e-mail ("Não consegue ver? Veja no navegador").
-- A rota pública /campanha/:id lê o HTML salvo em emails_enviados, então
-- visitantes anônimos precisam de SELECT nessa tabela.
--
-- Não há dado sensível na linha: assunto, corpo HTML já distribuído por e-mail,
-- nome do público e data. Os endereços dos destinatários ficam em
-- listas_destinatarios, que continua restrita a usuários autenticados.
CREATE POLICY "Anyone can read sent campaigns"
ON public.emails_enviados
FOR SELECT
TO anon
USING (true);
