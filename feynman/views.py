# -*- Python -*-
# -*- coding: utf-8 -*-
#
# alec aivazis
#
# this file describes the base views for feynman

# django imports
from django.views.generic import TemplateView

class Home(TemplateView):
    """
    render the index template
    """
    template_name = 'index.jade'


# end of file
