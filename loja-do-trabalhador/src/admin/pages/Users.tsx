import { collection, doc, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useQuery, me, toast } from '../store';
import { Badge, Loading } from '../ui';
import { audit } from '../audit';
import type { AdminRole, AdminUser } from '../../lib/types';

export function UsersPage() {
  const res = useQuery<AdminUser>(query(collection(db, 'admins')), []);
  const update = async (u: AdminUser, patch: Partial<AdminUser>, label: string) => {
    try {
      await updateDoc(doc(db, `admins/${u.id}`), { role: patch.role ?? u.role, active: patch.active ?? u.active });
      await audit('usuario.alterar', u.id, `${u.email}: ${label}`);
      toast('Usuário atualizado.');
    } catch {
      toast('Não foi possível alterar este usuário.', true);
    }
  };
  if (res.loading) return <Loading />;
  return (
    <div class="grid" style="gap:16px">
      <div class="page-head"><h1>Usuários e permissões</h1></div>
      <section class="card">
        <p style="margin-top:0"><strong>Administrador:</strong> faz tudo. <strong>Vendedor:</strong> vê produtos, pedidos e clientes; avança status, marca pagamento, registra venda manual e imprime. Não altera preço, não cancela, não exclui e não acessa Configurações.</p>
        <p class="hint" style="margin:0">Para criar um novo acesso, peça ao suporte técnico (VisionWeb) — ver “docs/SETUP.md → create-admin”. Não existe cadastro público.</p>
      </section>
      <table class="table stack">
        <thead><tr><th>Nome</th><th>E-mail</th><th>Papel</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {res.data.map((u) => {
            const self = u.id === me.value?.id;
            return (
              <tr>
                <td data-label="Nome">{u.name}{self && <span class="hint"> (você)</span>}</td>
                <td data-label="E-mail">{u.email}</td>
                <td data-label="Papel">
                  {self ? (u.role === 'admin' ? 'Administrador' : 'Vendedor') : (
                    <select class="select" style="width:auto" aria-label={`Papel de ${u.name}`} value={u.role} onChange={(e) => update(u, { role: e.currentTarget.value as AdminRole }, `papel ${e.currentTarget.value}`)}>
                      <option value="vendedor">Vendedor</option><option value="admin">Administrador</option>
                    </select>
                  )}
                </td>
                <td data-label="Status">{u.active ? <Badge kind="ok">Ativo</Badge> : <Badge kind="muted">Desativado</Badge>}</td>
                <td data-label="">{!self && <button class="btn btn-sm" type="button" onClick={() => update(u, { active: !u.active }, u.active ? 'desativado' : 'ativado')}>{u.active ? 'Desativar' : 'Ativar'}</button>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
