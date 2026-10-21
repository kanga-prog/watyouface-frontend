import LegalFooter from "../components/LegalFooter";

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
    <div className="space-y-3 text-slate-700">{children}</div>
  </section>
);

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6" aria-labelledby="privacy-title">
        <header className="space-y-3">
          <p className="text-sm font-medium text-blue-800">Information utilisateur</p>
          <h1 id="privacy-title" className="text-3xl font-bold text-slate-950">Politique de confidentialité</h1>
          <p className="text-slate-700">Version 1 — 20 octobre 2026</p>
        </header>

        <Section title="1. Responsable du traitement">
          <p>WatYouFace est un projet pédagogique. L’identité et les coordonnées de contact du responsable du traitement doivent être formalisées avant toute mise en production ouverte au public.</p>
        </Section>

        <Section title="2. Données traitées">
          <p>Le service traite les données nécessaires au compte et aux fonctionnalités : pseudo, adresse e-mail, mot de passe sous forme hachée, avatar facultatif, contenus publiés, interactions, messages, annonces, éléments de transaction de démonstration, wallet de démonstration et données techniques de sécurité. Depuis le Profil, la personne peut rectifier son e-mail après vérification de son mot de passe actuel, ainsi que changer son mot de passe.</p>
        </Section>

        <Section title="3. Finalités et bases juridiques">
          <p>Les données de compte et de service sont utilisées pour créer le compte, authentifier l’utilisateur, fournir le Feed, la messagerie et la Marketplace de démonstration. La base envisagée est l’exécution du contrat/CGU pour ces services. La sécurité, la prévention des abus et la modération reposent sur l’intérêt légitime à sécuriser le service ; cette qualification doit être validée avant exploitation publique.</p>
        </Section>

        <Section title="4. Destinataires et hébergement">
          <p>Les personnes autorisées à administrer le projet peuvent accéder aux données nécessaires à leur mission. Les prestataires techniques identifiés sont Hostinger pour le frontend et Railway pour le backend, PostgreSQL et le volume média. Aucun service d’analytics, newsletter ou prospection n’a été identifié dans le code actuel.</p>
        </Section>

        <Section title="5. Durées de conservation">
          <p>Les données sont conservées pendant la durée nécessaire aux finalités décrites et selon les obligations applicables. Les durées détaillées par catégorie sont en cours de formalisation ; aucune durée non validée n’est annoncée. Les historiques Marketplace et les acceptations de contrat nécessitent une validation spécifique avant toute purge.</p>
        </Section>

        <Section title="6. Sécurité">
          <p>Le projet met en œuvre notamment un mot de passe haché, un cookie d’authentification HttpOnly, CSRF, CORS explicite, contrôles de rôle et d’appartenance. Ces mesures techniques ne remplacent pas une analyse de risques ni une validation juridique complète.</p>
        </Section>

        <Section title="7. Vos droits">
          <p>Vous pouvez demander l’accès, la rectification, l’effacement, la limitation et, selon le cas, l’opposition ou la portabilité. Le profil permet de consulter les principales données de compte, de modifier le pseudo, l’avatar et l’adresse e-mail, de changer le mot de passe et de télécharger un export JSON des données associées au compte. Un parcours d’effacement est également disponible dans le profil. Les coordonnées de contact pour exercer ces droits restent à formaliser.</p>
        </Section>

        <Section title="8. Exercer vos droits et réclamation">
          <p>La procédure et le point de contact dédié pour les demandes de droits doivent encore être publiés. Tant qu’ils ne le sont pas, WatYouFace ne doit pas prétendre proposer un canal RGPD complet. Vous pouvez également introduire une réclamation auprès de la CNIL : cnil.fr.</p>
        </Section>
      </main>
      <LegalFooter />
    </div>
  );
}
