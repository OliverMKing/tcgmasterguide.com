import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

// Update this date whenever the policy content changes. Users must be told
// about changes to how the site uses Google user data (see section 9).
const LAST_UPDATED = '2026-11-10'
const CONTACT_EMAIL = 'grantm1999@hotmail.com'

type Section = {
  title: string
  paragraphs?: string[]
  bullets?: string[]
  after?: string[]
}

type PolicyContent = {
  title: string
  lastUpdatedLabel: string
  contentsLabel: string
  intro: string[]
  sections: Section[]
  translationNote?: string
}

const en: PolicyContent = {
  title: 'Privacy Policy',
  lastUpdatedLabel: 'Last updated',
  contentsLabel: 'Contents',
  intro: [
    'This Privacy Policy explains how TCG Master Guide ("TCG Master Guide", "we", "us"), the website at tcgmasterguide.com operated by Grant Manley, accesses, uses, stores, shares, and protects your information, including information we receive from Google when you sign in with your Google account.',
    'By using tcgmasterguide.com, you agree to the practices described in this policy.',
  ],
  sections: [
    {
      title: '1. Information we access',
      paragraphs: [
        'You can read most of TCG Master Guide without an account. If you create an account or sign in, we access the following information:',
      ],
      bullets: [
        'Google user data: if you choose "Sign in with Google", Google shares your name, email address, and profile picture with us, together with a unique account identifier. We request only the basic sign-in scopes (openid, email, and profile). We do not access your Gmail, Google Drive, Google Calendar, Google Contacts, or any other Google service data.',
        'Account information: your name, email address, and an account identifier from our sign-in provider, Clerk. This applies to every sign-in method, including email sign-in.',
        'Subscription information: if you subscribe, our payment processor Stripe collects your payment details. We never receive or store your full card number. We store your Stripe customer identifier, your subscription status, and your subscription end date.',
        'Comments: the text of any comment or question you post, and the display name shown with it.',
        'Usage information: anonymous page view counts for deck guide pages, collected with Microsoft Azure Application Insights. We do not use advertising or cross-site tracking cookies.',
        'Browser storage: your theme preference, a short-lived cache of your account role, and any discount code from a link you followed. This data stays in your browser.',
      ],
    },
    {
      title: '2. How we use your information',
      paragraphs: ['We use your information only to provide and improve the features of TCG Master Guide that you use:'],
      bullets: [
        'To create your account, sign you in, and keep you signed in.',
        'To show your name next to the comments you post.',
        'To process your subscription and give subscribers access to premium content.',
        'To contact you about your account or subscription when necessary.',
        'To keep the site secure and to find and fix errors.',
      ],
      after: [
        'We do not use Google user data for advertising, including personalized, retargeted, or interest-based advertising. We do not sell Google user data. We do not use Google user data to determine credit-worthiness or for lending purposes. We do not use Google user data to build databases for purposes unrelated to the features of this site.',
        'We do not use Google user data, or any data from Google Workspace APIs, to develop, improve, or train generalized or non-personalized artificial intelligence (AI) or machine learning (ML) models.',
      ],
    },
    {
      title: '3. Limited Use of Google user data',
      paragraphs: [
        "TCG Master Guide's use and transfer of information received from Google APIs to any other app will adhere to the Google API Services User Data Policy, including the Limited Use requirements. You can read that policy at https://developers.google.com/terms/api-services-user-data-policy.",
      ],
    },
    {
      title: '4. How we share your information',
      paragraphs: [
        'We do not sell, rent, or trade your personal information. We do not transfer Google user data to advertising platforms, data brokers, or information resellers. We share information only with the following service providers, and only as necessary to operate the site:',
      ],
      bullets: [
        'Clerk (clerk.com): authentication and account management. Clerk receives your sign-in information, including Google user data, to sign you in.',
        'Stripe (stripe.com): payment processing. Stripe receives your name, email address, and payment details when you subscribe.',
        'Microsoft Azure: hosting, database storage, and Application Insights usage analytics.',
      ],
      after: [
        'Each provider processes data on our behalf under its own privacy policy and security commitments. We may also disclose information if the law requires it, or to protect the rights, property, or safety of our users or others.',
        'The site can show embedded videos from YouTube and Twitch. When you play or view an embedded video, those services can collect data under their own privacy policies.',
      ],
    },
    {
      title: '5. How we protect your information',
      bullets: [
        'All traffic to tcgmasterguide.com uses HTTPS (TLS) encryption.',
        'Our database runs on Microsoft Azure, which encrypts data at rest.',
        'We do not store passwords. Clerk and Google handle authentication.',
        'We do not store payment card numbers. Stripe handles payment details.',
        'We verify the signatures of all webhook messages from Clerk and Stripe.',
        'Only site administrators can access account data, and only to operate the site.',
      ],
    },
    {
      title: '6. Data retention and deletion',
      paragraphs: [
        'We keep your account information while your account exists. We keep comments until you or an administrator removes them. Usage analytics are kept for a limited time and then deleted automatically.',
        'You can delete your account at any time from your account settings. When you delete your account, we delete your account record, including the Google user data we stored, from our database. You can also email us at ' +
          CONTACT_EMAIL +
          ' to ask us to delete your account, your comments, or any other personal data. We complete deletion requests within 30 days.',
        'Stripe can keep some payment records for longer when the law requires it, for example for tax and accounting purposes.',
        'You can also remove TCG Master Guide\'s access to your Google account at any time at https://myaccount.google.com/permissions.',
      ],
    },
    {
      title: '7. Your rights',
      paragraphs: [
        'Depending on where you live, you can have the right to access, correct, export, or delete your personal information, and to object to some processing. To use any of these rights, email us at ' +
          CONTACT_EMAIL +
          '.',
      ],
    },
    {
      title: "8. Children's privacy",
      paragraphs: [
        'TCG Master Guide is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you think a child gave us personal information, contact us and we will delete it.',
      ],
    },
    {
      title: '9. Changes to this policy',
      paragraphs: [
        'We can update this policy from time to time. We show the date of the latest change at the top of this page. If we change how we use Google user data, we will notify signed-in users by email or with a notice on the site before the change takes effect, and we will ask for your consent where required.',
      ],
    },
    {
      title: '10. Contact us',
      paragraphs: [
        'If you have questions about this policy or your data, contact Grant Manley, operator of TCG Master Guide, at ' +
          CONTACT_EMAIL +
          '.',
      ],
    },
  ],
}

const es: PolicyContent = {
  title: 'Política de privacidad',
  lastUpdatedLabel: 'Última actualización',
  contentsLabel: 'Contenido',
  translationNote:
    'Esta es una traducción de la versión en inglés. Si hay diferencias, prevalece la versión en inglés.',
  intro: [
    'Esta Política de privacidad explica cómo TCG Master Guide ("TCG Master Guide", "nosotros"), el sitio web tcgmasterguide.com operado por Grant Manley, accede, usa, almacena, comparte y protege tu información, incluida la información que recibimos de Google cuando inicias sesión con tu cuenta de Google.',
    'Al usar tcgmasterguide.com, aceptas las prácticas descritas en esta política.',
  ],
  sections: [
    {
      title: '1. Información a la que accedemos',
      paragraphs: [
        'Puedes leer la mayor parte de TCG Master Guide sin una cuenta. Si creas una cuenta o inicias sesión, accedemos a la siguiente información:',
      ],
      bullets: [
        'Datos de usuario de Google: si eliges "Iniciar sesión con Google", Google comparte con nosotros tu nombre, tu dirección de correo electrónico y tu foto de perfil, junto con un identificador único de cuenta. Solo solicitamos los permisos básicos de inicio de sesión (openid, email y profile). No accedemos a tu Gmail, Google Drive, Google Calendar, Google Contacts ni a datos de ningún otro servicio de Google.',
        'Información de la cuenta: tu nombre, tu correo electrónico y un identificador de cuenta de nuestro proveedor de inicio de sesión, Clerk. Esto aplica a todos los métodos de inicio de sesión.',
        'Información de suscripción: si te suscribes, nuestro procesador de pagos Stripe recopila tus datos de pago. Nunca recibimos ni almacenamos el número completo de tu tarjeta. Almacenamos tu identificador de cliente de Stripe, el estado de tu suscripción y su fecha de finalización.',
        'Comentarios: el texto de cualquier comentario o pregunta que publiques y el nombre que se muestra con él.',
        'Información de uso: recuentos anónimos de visitas a las páginas de guías de decks, recopilados con Microsoft Azure Application Insights. No usamos cookies publicitarias ni de seguimiento entre sitios.',
        'Almacenamiento del navegador: tu preferencia de tema, una caché temporal del rol de tu cuenta y cualquier código de descuento de un enlace que hayas seguido. Estos datos permanecen en tu navegador.',
      ],
    },
    {
      title: '2. Cómo usamos tu información',
      paragraphs: ['Usamos tu información solo para ofrecer y mejorar las funciones de TCG Master Guide que utilizas:'],
      bullets: [
        'Para crear tu cuenta, iniciar tu sesión y mantenerla activa.',
        'Para mostrar tu nombre junto a los comentarios que publiques.',
        'Para procesar tu suscripción y dar acceso al contenido premium a los suscriptores.',
        'Para contactarte sobre tu cuenta o suscripción cuando sea necesario.',
        'Para mantener el sitio seguro y para encontrar y corregir errores.',
      ],
      after: [
        'No usamos datos de usuario de Google para publicidad, incluida la publicidad personalizada, de retargeting o basada en intereses. No vendemos datos de usuario de Google. No usamos datos de usuario de Google para evaluar la solvencia crediticia ni con fines de préstamo. No usamos datos de usuario de Google para crear bases de datos con fines ajenos a las funciones de este sitio.',
        'No usamos datos de usuario de Google, ni datos de las API de Google Workspace, para desarrollar, mejorar o entrenar modelos generalizados o no personalizados de inteligencia artificial (IA) o aprendizaje automático (ML).',
      ],
    },
    {
      title: '3. Uso limitado de los datos de usuario de Google',
      paragraphs: [
        'El uso y la transferencia a cualquier otra aplicación, por parte de TCG Master Guide, de la información recibida de las API de Google cumplirán la Política de datos de usuario de los servicios de API de Google (Google API Services User Data Policy), incluidos los requisitos de uso limitado (Limited Use). Puedes leer esa política en https://developers.google.com/terms/api-services-user-data-policy.',
      ],
    },
    {
      title: '4. Cómo compartimos tu información',
      paragraphs: [
        'No vendemos, alquilamos ni intercambiamos tu información personal. No transferimos datos de usuario de Google a plataformas publicitarias, intermediarios de datos ni revendedores de información. Solo compartimos información con los siguientes proveedores de servicios, y solo cuando es necesario para operar el sitio:',
      ],
      bullets: [
        'Clerk (clerk.com): autenticación y gestión de cuentas. Clerk recibe tu información de inicio de sesión, incluidos los datos de usuario de Google, para iniciar tu sesión.',
        'Stripe (stripe.com): procesamiento de pagos. Stripe recibe tu nombre, tu correo electrónico y tus datos de pago cuando te suscribes.',
        'Microsoft Azure: alojamiento, almacenamiento de la base de datos y analítica de uso con Application Insights.',
      ],
      after: [
        'Cada proveedor trata los datos en nuestro nombre conforme a su propia política de privacidad y compromisos de seguridad. También podemos divulgar información si la ley lo exige, o para proteger los derechos, la propiedad o la seguridad de nuestros usuarios o de otras personas.',
        'El sitio puede mostrar videos incrustados de YouTube y Twitch. Cuando reproduces o ves un video incrustado, esos servicios pueden recopilar datos conforme a sus propias políticas de privacidad.',
      ],
    },
    {
      title: '5. Cómo protegemos tu información',
      bullets: [
        'Todo el tráfico a tcgmasterguide.com usa cifrado HTTPS (TLS).',
        'Nuestra base de datos se ejecuta en Microsoft Azure, que cifra los datos en reposo.',
        'No almacenamos contraseñas. Clerk y Google gestionan la autenticación.',
        'No almacenamos números de tarjetas de pago. Stripe gestiona los datos de pago.',
        'Verificamos las firmas de todos los mensajes webhook de Clerk y Stripe.',
        'Solo los administradores del sitio pueden acceder a los datos de las cuentas, y solo para operar el sitio.',
      ],
    },
    {
      title: '6. Conservación y eliminación de datos',
      paragraphs: [
        'Conservamos la información de tu cuenta mientras tu cuenta exista. Conservamos los comentarios hasta que tú o un administrador los elimine. La analítica de uso se conserva durante un tiempo limitado y luego se elimina automáticamente.',
        'Puedes eliminar tu cuenta en cualquier momento desde la configuración de tu cuenta. Cuando eliminas tu cuenta, borramos de nuestra base de datos el registro de tu cuenta, incluidos los datos de usuario de Google que almacenamos. También puedes escribirnos a ' +
          CONTACT_EMAIL +
          ' para pedirnos que eliminemos tu cuenta, tus comentarios o cualquier otro dato personal. Completamos las solicitudes de eliminación en un plazo de 30 días.',
        'Stripe puede conservar algunos registros de pago durante más tiempo cuando la ley lo exige, por ejemplo con fines fiscales y contables.',
        'También puedes retirar el acceso de TCG Master Guide a tu cuenta de Google en cualquier momento en https://myaccount.google.com/permissions.',
      ],
    },
    {
      title: '7. Tus derechos',
      paragraphs: [
        'Según el lugar donde vivas, puedes tener derecho a acceder, corregir, exportar o eliminar tu información personal, y a oponerte a algunos tratamientos. Para ejercer cualquiera de estos derechos, escríbenos a ' +
          CONTACT_EMAIL +
          '.',
      ],
    },
    {
      title: '8. Privacidad de los menores',
      paragraphs: [
        'TCG Master Guide no está dirigido a menores de 13 años. No recopilamos a sabiendas información personal de menores de 13 años. Si crees que un menor nos ha dado información personal, contáctanos y la eliminaremos.',
      ],
    },
    {
      title: '9. Cambios en esta política',
      paragraphs: [
        'Podemos actualizar esta política periódicamente. Mostramos la fecha del último cambio en la parte superior de esta página. Si cambiamos la forma en que usamos los datos de usuario de Google, avisaremos a los usuarios registrados por correo electrónico o con un aviso en el sitio antes de que el cambio entre en vigor, y pediremos tu consentimiento cuando sea necesario.',
      ],
    },
    {
      title: '10. Contacto',
      paragraphs: [
        'Si tienes preguntas sobre esta política o sobre tus datos, contacta con Grant Manley, operador de TCG Master Guide, en ' +
          CONTACT_EMAIL +
          '.',
      ],
    },
  ],
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const content = locale === 'es' ? es : en
  return {
    title: content.title,
    description:
      locale === 'es'
        ? 'Cómo TCG Master Guide accede, usa, almacena, comparte y protege tus datos, incluidos los datos de usuario de Google.'
        : 'How TCG Master Guide accesses, uses, stores, shares, and protects your data, including Google user data.',
  }
}

const linkClass = 'text-accent-text underline underline-offset-4 decoration-1 hover:decoration-2'

// Turn bare URLs and the contact email into links.
function linkify(text: string) {
  const parts = text.split(/(https:\/\/\S+?(?=[.,]?(?:\s|$))|[\w.+-]+@[\w-]+\.[\w.]+\w)/g)
  return parts.map((part, i) => {
    if (part.startsWith('https://')) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={`${linkClass} break-all`}>
          {part}
        </a>
      )
    }
    if (part.includes('@') && /^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part)) {
      return (
        <a key={i} href={`mailto:${part}`} className={linkClass}>
          {part}
        </a>
      )
    }
    return part
  })
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const content = locale === 'es' ? es : en
  const formattedDate = new Date(`${LAST_UPDATED}T00:00:00Z`).toLocaleDateString(
    locale === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }
  )

  const sectionId = (i: number) => `section-${i + 1}`

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-20">
        <header className="max-w-[68ch]">
          <h1 className="font-display font-black text-ink text-5xl sm:text-6xl leading-[0.9]">{content.title}</h1>
          <p className="mt-4 text-ink-3">
            {content.lastUpdatedLabel}: <time dateTime={LAST_UPDATED}>{formattedDate}</time>
          </p>
        </header>

        <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,68ch)_15rem] lg:gap-16 lg:items-start">
          <nav
            aria-labelledby="contents-title"
            className="mb-10 border-y border-line py-5 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-24 lg:mb-0 lg:border-b-0 lg:border-t-0 lg:border-l lg:py-0 lg:pl-6"
          >
            <h2 id="contents-title" className="font-bold text-ink mb-3">
              {content.contentsLabel}
            </h2>
            <ol className="space-y-2 text-[0.95rem]">
              {content.sections.map((section, i) => (
                <li key={section.title}>
                  <a href={`#${sectionId(i)}`} className="text-ink-2 hover:text-ink hover:underline underline-offset-4">
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="lg:col-start-1 lg:row-start-1 text-ink-2 leading-relaxed">
            {content.translationNote && (
              <p className="mb-6 rounded-[10px] bg-surface-2 px-4 py-3 text-sm text-ink-2">{content.translationNote}</p>
            )}
            {content.intro.map((p, i) => (
              <p key={i} className="mb-4">
                {linkify(p)}
              </p>
            ))}

            {content.sections.map((section, i) => (
              <section key={section.title} id={sectionId(i)} className="mt-12 scroll-mt-24">
                <h2 className="font-display font-extrabold text-ink text-2xl sm:text-3xl leading-none mb-4">{section.title}</h2>
                {section.paragraphs?.map((p, j) => (
                  <p key={j} className="mb-4">
                    {linkify(p)}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="list-disc pl-5 space-y-2.5 mb-4 marker:text-ink-3">
                    {section.bullets.map((b, j) => (
                      <li key={j} className="pl-1">{linkify(b)}</li>
                    ))}
                  </ul>
                )}
                {section.after?.map((p, j) => (
                  <p key={j} className="mb-4">
                    {linkify(p)}
                  </p>
                ))}
              </section>
            ))}
          </article>
        </div>
      </div>
    </main>
  )
}
