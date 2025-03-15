from flask import Flask, render_template, jsonify
from flask_cors import CORS  # Importe o CORS
import os
import time
import webbrowser

app = Flask(__name__)
CORS(app)  # Ative o CORS para toda a aplicação


# Detectando o ambiente
# No Render, a variável de ambiente RENDER estará definida ou PORT será 10000
# Também verificamos se estamos em qualquer ambiente de produção
IS_CLOUD = (os.environ.get('RENDER') is not None 
           or os.environ.get('PORT') == '10000' 
           or os.environ.get('ENVIRONMENT') == 'production'
           or os.environ.get('PYTHON_ENV') == 'production')


# Detectando o ambiente
# No Render, a variável de ambiente RENDER estará definida
IS_CLOUD = os.environ.get('RENDER') is not None or os.environ.get('PORT') == '10000'

# Configuração do navegador (apenas para ambiente local)
if not IS_CLOUD:
    FIREFOX_PATH = r"C:\Program Files\Firefox Developer Edition\firefox.exe"
    EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    
    # Verifica se o Firefox Developer está instalado
    if os.path.exists(FIREFOX_PATH):
        webbrowser.register('browser', None, webbrowser.BackgroundBrowser(FIREFOX_PATH))
        BROWSER_NAME = "Firefox Developer Edition"
    else:
        # Se não estiver, usa o Edge
        webbrowser.register('browser', None, webbrowser.BackgroundBrowser(EDGE_PATH))
        BROWSER_NAME = "Microsoft Edge"
else:
    BROWSER_NAME = "Navegador Web"

# Lista de sites externos para abrir
SITES = [
    {
        'name': 'Estatísticas | Calculadora Combinações (Dígitos)',
        'url': 'https://combinacao-ii.onrender.com//'
    },
       {
        'name': 'Estatísticas | Análise de Palpites (Digitos)',
        'url': 'https://analisedospalpitesms.onrender.com/'
    },
        {
        'name': 'Estratégias | Palpites II',
        'url': 'https://palpitesms.onrender.com/'
    },
        {
        'name': 'Geradores | Combinação I',
        'url': 'https://combinacao-i.onrender.com/'
    },
        {
        'name': 'Estatísticas | Análise de Dígitos',
        'url': 'https://resultadosdigitosmegasena.onrender.com/'
    },
        {
        'name': 'Estatísticas | Resumo',
        'url': 'https://resumomegasena.onrender.com/'
    },
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/list_sites')
def list_sites():
    try:
        return jsonify({
            'sites': SITES,
            'browser_info': {
                'name': BROWSER_NAME,
                'is_cloud': IS_CLOUD
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/open_site/<int:site_id>')
def open_site(site_id):
    try:
        if 0 <= site_id < len(SITES):
            site = SITES[site_id]
            
            # Em ambiente local, tenta abrir com webbrowser
            browser_opened = False
            if not IS_CLOUD:
                try:
                    webbrowser.get('browser').open(site['url'])
                    browser_opened = True
                except:
                    # Se falhar, o frontend lidará com isso
                    pass
            
            return jsonify({
                'success': True,
                'message': f'Site {site["name"]} aberto' + (f' no {BROWSER_NAME}' if browser_opened else ''),
                'url': site['url'],
                'browser_opened': browser_opened
            })
        return jsonify({
            'success': False,
            'message': 'Site não encontrado'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

@app.route('/open_all_sites')
def open_all_sites():
    try:
        urls = [site['url'] for site in SITES]
        
        # Em ambiente local, tenta abrir com webbrowser
        browser_opened = False
        if not IS_CLOUD:
            try:
                # Primeiro site abre em nova janela
                webbrowser.get('browser').open(urls[0])
                
                # Pequena pausa para garantir que a primeira janela abra
                time.sleep(0.5)
                
                # Resto dos sites abrem em novas abas na mesma janela
                for url in urls[1:]:
                    webbrowser.get('browser').open_new_tab(url)
                    # Pequena pausa para evitar sobrecarga
                    time.sleep(0.3)
                    
                browser_opened = True
            except Exception as browser_error:
                app.logger.error(f"Erro ao abrir navegador: {str(browser_error)}")
                # Se falhar, o frontend lidará com isso
                pass
        
        return jsonify({
            'success': True,
            'message': f'Todos os {len(SITES)} sites foram' + (f' abertos no {BROWSER_NAME}' if browser_opened else ' preparados para abrir'),
            'urls': urls,
            'browser_opened': browser_opened,
            'is_cloud': IS_CLOUD
        })
    except Exception as e:
        app.logger.error(f"Erro ao preparar sites: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e),
            'is_cloud': IS_CLOUD
        })


if __name__ == '__main__':
    # Use a porta fornecida pelo ambiente ou 5001 como padrão
    port = int(os.environ.get('PORT', 5001))
    # No Render precisa ser 0.0.0.0
    host = '0.0.0.0'
    debug = not IS_CLOUD  # Desativa debug em produção
    app.run(host=host, port=port, debug=debug)