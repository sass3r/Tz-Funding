import smartpy as sp

FA2 = sp.io.import_script_from_url("https://smartpy.io/dev/templates/FA2.py")

class Token(FA2.FA2):
    pass

sp.add_compilation_target("compile",Token(FA2.FA2_config(non_fungible = True),admin = sp.address("tz1LLqguTGf9bA5zAERm99uxsiNHKpibtvtJ"), metadata = sp.utils.metadata_of_url("ipfs://bafkreiewnvr2t75jcwty7tkl2jzq2o566phqc4h6xas252lpwfpgfu6pvi")))